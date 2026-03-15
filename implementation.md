# AIMS — Implementation Guide

**Academic Infrastructure Management System**
Full-stack architecture: Next.js 14 frontend + Python FastAPI backend + Supabase (future).

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser / Client                             │
│                                                                     │
│   Next.js 14 App (src/)                                             │
│   ┌──────────────┐   ┌──────────────┐   ┌───────────────────────┐  │
│   │  Landing /   │   │  Branch      │   │  Dashboards           │  │
│   │  Home Page   │   │  Pages       │   │  /dashboard/student   │  │
│   │  /page.tsx   │   │  /branches/* │   │  /dashboard/teacher   │  │
│   └──────────────┘   └──────────────┘   └───────────────────────┘  │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Components layer  (src/components/)                         │  │
│   │  ChatbotWidget · BranchPageTemplate · Navbar · ThemeToggle   │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Services / API layer  (src/services/, src/api/)             │  │
│   │  csvService.ts · authService.ts · marks.ts · resources.ts   │  │
│   └─────────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │ HTTP (fetch)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Python FastAPI Backend  (backend/)               │
│                                                                     │
│   main.py                                                           │
│   ├── GET  /health          → "ok"                                  │
│   ├── POST /chat            → chatbot.py → chatbotData.json         │
│   ├── POST /upload/students → csv_processor.process_students_csv()  │
│   └── POST /upload/unit-test→ csv_processor.process_unit_test_csv() │
│                                                                     │
│   supabase_client.py  ← PLACEHOLDER (no connection yet)            │
└─────────────────────────────────────────────────────────────────────┘
                                  │  (future)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Supabase (not yet connected)                     │
│   Tables: students, unit_test_marks, users, notices, tickets        │
│   Storage: guide-videos, marks-uploads, resources, timetables      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Structure

### Pages (`src/app/`)
| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` | Landing page with hero, features, notice board |
| `/branches/cse` | `branches/cse/page.tsx` | CSE department page |
| `/branches/it` | `branches/it/page.tsx` | IT department page |
| `/branches/elex` | `branches/elex/page.tsx` | ELEX department page |
| `/login` | `login/page.tsx` | Login page |
| `/signup` | `signup/page.tsx` | Signup page |
| `/dashboard/student` | `dashboard/student/page.tsx` | Student dashboard |
| `/dashboard/teacher` | `dashboard/teacher/page.tsx` | Teacher dashboard |

### Key Components (`src/components/`)
- **`chatbot-widget.tsx`** — Floating chat widget. Uses local keyword matching by default. When `NEXT_PUBLIC_API_URL` is set, sends queries to `POST /chat` and falls back to local if the backend is unreachable.
- **`branch-page-template.tsx`** — Shared template for all branch pages.
- **`navbar.tsx`** — Top navigation bar.

### Service Layer (`src/services/`, `src/api/`)
- **`csvService.ts`** — Typed `fetch()` wrappers for the Python backend CSV endpoints.
- **`marks.ts`** — `uploadMarksCSV()` calls `csvService.uploadUnitTestCSV()`.
- **`authService.ts`** — Auth stubs ready for Supabase wiring.
- **`resourceService.ts`** — Resource stubs ready for Supabase wiring.

---

## Chatbot Logic

### Knowledge Base
Located at: `public/assets/chatbot/chatbotData.json`

Structure:
```json
{
  "faqs": [
    {
      "id": "cse_lab",
      "keywords": ["cse lab", "computer science lab", ...],
      "question": "Where is CSE Lab?",
      "answer": "The CSE Computer Lab A is on the Ground Floor...",
      "video": "cse_lab_navigation.mp4",
      "link": "/branches/cse"
    }
  ],
  "defaultResponse": "...",
  "greeting": "...",
  "suggestions": [...]
}
```

### Matching Flow (Python backend)

```
User message
    │
    ▼
chatbot.py :: get_bot_response()
    │
    ├── For each FAQ entry:
    │     RapidFuzz.token_set_ratio(user_message, keyword)
    │     RapidFuzz.partial_ratio(user_message, question_text)
    │
    ├── Best score ≥ 60 → return matched FAQ answer + video_url + navigation_link
    │
    └── Best score < 60 → return defaultResponse
```

### Frontend Fallback Flow

```
sendMessage(text)
    │
    ├── fetchBotResponse(text)   ← calls POST /chat if NEXT_PUBLIC_API_URL is set
    │       │ success → use API response
    │       │ error / no URL → return null
    │
    └── null → getResponse(text)  ← local keyword matching from chatbotData.json
```

---

## CSV Upload Workflow

### Student List
1. Teacher opens Dashboard → Upload Center → **Student List CSV** tab.
2. Selects a `.csv` file with columns: `roll_no, name, year, branch`.
3. Frontend calls `csvService.uploadStudentCSV(file)` → `POST /upload/students`.
4. Python backend validates each row and returns `{inserted, failed, errors}`.
5. *(Future)* After Supabase setup: backend inserts valid rows into `students` table.

### Unit Test Marks
1. Teacher opens Dashboard → Upload Center → **Marks CSV** tab.
2. Selects a `.csv` file with columns: `roll_no, subject, marks, semester`.
3. Frontend calls `marks.ts::uploadMarksCSV()` → `csvService.uploadUnitTestCSV()` → `POST /upload/unit-test`.
4. Python backend validates marks values (must be non-negative integers) and returns results.
5. *(Future)* After Supabase setup: backend inserts valid rows into `unit_test_marks` table.

---

## Running Locally

### 1. Start the Python Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

### 2. Configure the Frontend

```bash
# In the project root:
cp .env.local.example .env.local
# Edit .env.local and set:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start the Next.js Frontend

```bash
npm run dev
# or
bun dev
```

Frontend at `http://localhost:3000`.

---

## API Reference

### `GET /health`
```json
{ "status": "ok", "service": "AIMS API" }
```

### `POST /chat`
**Request:** `{ "message": "Where is CSE Lab?" }`

**Response:**
```json
{
  "answer": "The CSE Computer Lab A is on the Ground Floor...",
  "video_url": "cse_lab_navigation.mp4",
  "navigation_link": "/branches/cse"
}
```

### `POST /upload/students`
**Request:** multipart/form-data with `file` field (`.csv`)

**CSV format:** `roll_no, name, year, branch`

**Response:**
```json
{
  "success": true,
  "inserted": 3,
  "failed": 1,
  "errors": ["Row 4 skipped — name is empty"]
}
```

### `POST /upload/unit-test`
**Request:** multipart/form-data with `file` field (`.csv`)

**CSV format:** `roll_no, subject, marks, semester`

**Response:**
```json
{
  "success": true,
  "inserted": 5,
  "failed": 1,
  "errors": ["Row 3 skipped — marks must be an integer, got 'N/A'"]
}
```

---

## Next Steps: Supabase Integration

See `supabase.md` for full step-by-step instructions.

1. Create Supabase project and run table SQL schemas.
2. Create storage buckets (`guide-videos`, `marks-uploads`, `resources`, `timetables`).
3. Add env variables to `backend/.env` and `.env.local`.
4. Uncomment code in `backend/supabase_client.py`.
5. In `backend/csv_processor.py`, import `supabase` and call `.insert()` after validation.
6. Wire `src/lib/supabaseClient.ts` for frontend auth and data queries.
