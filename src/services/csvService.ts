/**
 * AIMS CSV Service
 * Typed fetch helpers for the Python FastAPI backend CSV upload endpoints.
 *
 * Usage in Teacher Dashboard:
 *   import { uploadStudentCSV, uploadUnitTestCSV } from "@/services/csvService";
 *
 *   const result = await uploadStudentCSV(file);
 *   if (result.success) {
 *     console.log(`Inserted: ${result.inserted}, Failed: ${result.failed}`);
 *   }
 *
 * Requires NEXT_PUBLIC_API_URL to be set in .env.local:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000
 */

export interface UploadResult {
  success: boolean;
  inserted: number;
  failed: number;
  errors: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Upload a student list CSV to POST /upload/students.
 *
 * Expected CSV columns: roll_no, name, year, branch
 *
 * Returns counts of inserted vs failed rows.
 * Falls back to a descriptive error if NEXT_PUBLIC_API_URL is not configured.
 */
export async function uploadStudentCSV(file: File): Promise<UploadResult> {
  if (!API_BASE) {
    return {
      success: false,
      inserted: 0,
      failed: 0,
      errors: [
        "Backend URL not configured. Set NEXT_PUBLIC_API_URL in .env.local.",
      ],
    };
  }

  const form = new FormData();
  form.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/upload/students`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const detail = await res.text();
      return {
        success: false,
        inserted: 0,
        failed: 0,
        errors: [`Server error ${res.status}: ${detail}`],
      };
    }

    return (await res.json()) as UploadResult;
  } catch (err) {
    return {
      success: false,
      inserted: 0,
      failed: 0,
      errors: [`Network error: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}

/**
 * Upload a unit test marks CSV to POST /upload/unit-test.
 *
 * Expected CSV columns: roll_no, subject, marks, semester
 *
 * Returns counts of inserted vs failed rows with per-row error details.
 * Falls back to a descriptive error if NEXT_PUBLIC_API_URL is not configured.
 */
export async function uploadUnitTestCSV(file: File): Promise<UploadResult> {
  if (!API_BASE) {
    return {
      success: false,
      inserted: 0,
      failed: 0,
      errors: [
        "Backend URL not configured. Set NEXT_PUBLIC_API_URL in .env.local.",
      ],
    };
  }

  const form = new FormData();
  form.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/upload/unit-test`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const detail = await res.text();
      return {
        success: false,
        inserted: 0,
        failed: 0,
        errors: [`Server error ${res.status}: ${detail}`],
      };
    }

    return (await res.json()) as UploadResult;
  } catch (err) {
    return {
      success: false,
      inserted: 0,
      failed: 0,
      errors: [`Network error: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}
