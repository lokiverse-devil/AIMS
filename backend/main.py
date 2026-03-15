"""
AIMS — FastAPI Backend
======================
Main application entry point. Exposes all API endpoints.

Run locally:
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload

Endpoints:
    GET  /health              — Health check
    POST /chat                — Chatbot query
    POST /upload/students     — Student list CSV upload
    POST /upload/unit-test    — Unit test marks CSV upload

CORS is open for localhost:3000 (Next.js dev server).
Tighten origin list before deploying to production.
"""

from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from chatbot import get_bot_response
from csv_processor import process_students_csv, process_unit_test_csv

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AIMS API",
    description="Academic Infrastructure Management System — Python Backend",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allow the Next.js frontend (localhost:3000) to call this backend.
# Add your production domain here before going live, e.g.:
#   "https://aims.yourdomain.com"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    video_url: Optional[str] = None
    navigation_link: Optional[str] = None


class UploadResponse(BaseModel):
    success: bool
    inserted: int
    failed: int
    errors: list[str]


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint.
    Returns 200 OK with status message.
    Call this to verify the backend is running before making other requests.
    """
    return {"status": "ok", "service": "AIMS API"}


@app.post("/chat", response_model=ChatResponse, tags=["Chatbot"])
async def chat(request: ChatRequest):
    """
    Chatbot endpoint.

    Accepts a user message and returns the best matching answer from
    the AIMS knowledge base (public/assets/chatbot/chatbotData.json).

    Uses RapidFuzz token_set_ratio for fuzzy keyword + question matching.

    Request body:
        { "message": "Where is CSE Lab?" }

    Response:
        {
            "answer": "The CSE Computer Lab A is on the Ground Floor...",
            "video_url": "cse_lab_navigation.mp4",
            "navigation_link": "/branches/cse"
        }

    Frontend integration:
        chatbot-widget.tsx calls POST /chat when NEXT_PUBLIC_API_URL is set.
        Falls back to local keyword matching when the backend is unavailable.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    result = get_bot_response(request.message)
    return ChatResponse(**result)


@app.post("/upload/students", response_model=UploadResponse, tags=["CSV Upload"])
async def upload_students(file: UploadFile = File(...)):
    """
    Upload a student list CSV file.

    Required CSV columns: roll_no, name, year, branch

    Example CSV content:
        roll_no,name,year,branch
        CSE2022047,Rahul Sharma,3rd Year,CSE
        CSE2023011,Sneha Patil,2nd Year,CSE

    Processing:
        - Validates required columns exist
        - Skips rows with missing/empty required fields
        - Returns count of inserted vs failed rows with error detail

    TODO (Supabase integration):
        Once supabase_client.py is configured, insert validated rows into
        the 'students' table. See supabase_client.py for schema.

    Frontend integration:
        src/services/csvService.ts → uploadStudentCSV()
        Teacher Dashboard → Upload Center → Student List CSV tab
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only .csv files are accepted for student list upload."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    result = process_students_csv(file_bytes)
    return UploadResponse(
        success=result["success"],
        inserted=result["inserted"],
        failed=result["failed"],
        errors=result["errors"],
    )


@app.post("/upload/unit-test", response_model=UploadResponse, tags=["CSV Upload"])
async def upload_unit_test(file: UploadFile = File(...)):
    """
    Upload a unit test marks CSV file.

    Required CSV columns: roll_no, subject, marks, semester

    Example CSV content:
        roll_no,subject,marks,semester
        CSE2022047,Data Structures,18,6th
        CSE2022023,Data Structures,17,6th

    Processing:
        - Validates required columns exist
        - Skips rows where marks is not a non-negative integer
        - Returns count of inserted vs failed rows with error detail

    TODO (Supabase integration):
        Once supabase_client.py is configured, insert validated rows into
        the 'unit_test_marks' table. See supabase_client.py for schema.

    Frontend integration:
        src/api/marks.ts → uploadMarksCSV() → csvService.uploadUnitTestCSV()
        Teacher Dashboard → Upload Center → Marks CSV tab
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only .csv files are accepted for marks upload."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    result = process_unit_test_csv(file_bytes)
    return UploadResponse(
        success=result["success"],
        inserted=result["inserted"],
        failed=result["failed"],
        errors=result["errors"],
    )
