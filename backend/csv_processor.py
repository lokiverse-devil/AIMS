"""
AIMS CSV Processor
Handles parsing and validation for:
  - Student list CSV  (roll_no, name, year, branch)
  - Unit test marks CSV (roll_no, subject, marks, semester)

Returns structured results with inserted count, failed count, and error details.
Rows are NOT inserted into a database yet — Supabase integration is a future step.
See backend/supabase_client.py for database connection instructions.
"""

from __future__ import annotations

import csv
import io
from typing import Any


# ─── Shared helpers ───────────────────────────────────────────────────────────

def _read_csv(file_bytes: bytes) -> tuple[list[str], list[dict[str, str]]]:
    """
    Parse raw CSV bytes.
    Returns (header_columns, list_of_row_dicts).
    Strips whitespace from all keys and values.
    """
    text = file_bytes.decode("utf-8-sig", errors="replace")  # handle BOM
    reader = csv.DictReader(io.StringIO(text))
    headers = [h.strip() for h in (reader.fieldnames or [])]
    rows: list[dict[str, str]] = []
    for row in reader:
        cleaned = {k.strip(): (v.strip() if v else "") for k, v in row.items() if k}
        rows.append(cleaned)
    return headers, rows


def _missing_columns(required: list[str], actual: list[str]) -> list[str]:
    actual_lower = [c.lower() for c in actual]
    return [r for r in required if r.lower() not in actual_lower]


# ─── Student CSV Processor ────────────────────────────────────────────────────

STUDENT_REQUIRED_COLUMNS = ["roll_no", "name", "year", "branch"]


def process_students_csv(file_bytes: bytes) -> dict[str, Any]:
    """
    Parse a student list CSV.

    Expected columns: roll_no, name, year, branch

    Returns:
        {
            "success": bool,
            "inserted": int,       # rows that passed validation
            "failed": int,         # rows skipped due to errors
            "errors": list[str],   # human-readable error messages per bad row
            "rows": list[dict]     # validated row data (ready for DB insert)
        }
    """
    from supabase_client import supabase
    try:
        headers, rows = _read_csv(file_bytes)
    except Exception as exc:
        return {
            "success": False,
            "inserted": 0,
            "failed": 0,
            "errors": [f"Failed to parse CSV: {exc}"],
            "rows": [],
        }

    missing = _missing_columns(STUDENT_REQUIRED_COLUMNS, headers)
    if missing:
        return {
            "success": False,
            "inserted": 0,
            "failed": 0,
            "errors": [f"Missing required column(s): {', '.join(missing)}"],
            "rows": [],
        }

    valid_rows: list[dict] = []
    errors: list[str] = []

    for idx, row in enumerate(rows, start=2):  # start=2 accounts for header row
        roll_no = row.get("roll_no", "").strip()
        name = row.get("name", "").strip()
        year = row.get("year", "").strip()
        branch = row.get("branch", "").strip()

        row_errors: list[str] = []

        if not roll_no:
            row_errors.append("roll_no is empty")
        if not name:
            row_errors.append("name is empty")
        if not year:
            row_errors.append("year is empty")
        if not branch:
            row_errors.append("branch is empty")

        if row_errors:
            errors.append(f"Row {idx} skipped — {'; '.join(row_errors)}")
            continue

        valid_rows.append({
            "roll_no": roll_no,
            "name": name,
            "year": year,
            "branch": branch,
        })

    try:
        if valid_rows and supabase:
            # We use upsert since roll_no is unique and might already exist
            supabase.table("students").upsert(valid_rows, on_conflict="roll_no").execute()
    except Exception as exc:
        return {
            "success": False,
            "inserted": 0,
            "failed": len(rows),
            "errors": [f"Database insertion failed: {exc}"],
            "rows": [],
        }

    return {
        "success": True,
        "inserted": len(valid_rows),
        "failed": len(errors),
        "errors": errors,
        "rows": valid_rows,
    }


# ─── Unit Test Marks CSV Processor ───────────────────────────────────────────

MARKS_REQUIRED_COLUMNS = ["roll_no", "subject", "marks", "semester"]


def process_unit_test_csv(file_bytes: bytes) -> dict[str, Any]:
    """
    Parse a unit test marks CSV.

    Expected columns: roll_no, subject, marks, semester

    Validation rules:
      - roll_no, subject, semester must be non-empty strings
      - marks must be a non-negative integer

    Returns:
        {
            "success": bool,
            "inserted": int,
            "failed": int,
            "errors": list[str],
            "rows": list[dict]     # validated rows (ready for DB insert)
        }
    """
    from supabase_client import supabase
    try:
        headers, rows = _read_csv(file_bytes)
    except Exception as exc:
        return {
            "success": False,
            "inserted": 0,
            "failed": 0,
            "errors": [f"Failed to parse CSV: {exc}"],
            "rows": [],
        }

    missing = _missing_columns(MARKS_REQUIRED_COLUMNS, headers)
    if missing:
        return {
            "success": False,
            "inserted": 0,
            "failed": 0,
            "errors": [f"Missing required column(s): {', '.join(missing)}"],
            "rows": [],
        }

    valid_rows: list[dict] = []
    errors: list[str] = []

    for idx, row in enumerate(rows, start=2):
        roll_no = row.get("roll_no", "").strip()
        subject = row.get("subject", "").strip()
        marks_raw = row.get("marks", "").strip()
        semester = row.get("semester", "").strip()

        row_errors: list[str] = []

        if not roll_no:
            row_errors.append("roll_no is empty")
        if not subject:
            row_errors.append("subject is empty")
        if not semester:
            row_errors.append("semester is empty")

        # Validate marks is a non-negative integer
        marks_value: int | None = None
        if not marks_raw:
            row_errors.append("marks is empty")
        else:
            try:
                marks_value = int(marks_raw)
                if marks_value < 0:
                    row_errors.append(f"marks must be >= 0, got {marks_value}")
                    marks_value = None
            except ValueError:
                row_errors.append(f"marks must be an integer, got '{marks_raw}'")

        if row_errors:
            errors.append(f"Row {idx} skipped — {'; '.join(row_errors)}")
            continue

        valid_rows.append({
            "roll_no": roll_no,
            "subject": subject,
            "marks": marks_value,
            "semester": semester,
        })

    try:
        if valid_rows and supabase:
            supabase.table("unit_test_marks").insert(valid_rows).execute()
    except Exception as exc:
        return {
            "success": False,
            "inserted": 0,
            "failed": len(rows),
            "errors": [f"Database insertion failed: {exc}"],
            "rows": [],
        }

    return {
        "success": True,
        "inserted": len(valid_rows),
        "failed": len(errors),
        "errors": errors,
        "rows": valid_rows,
    }
