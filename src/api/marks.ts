// Supabase table: unit_test_marks (columns: id, roll_no, subject, test_name, marks, max_marks, semester, uploaded_by, uploaded_at)
// TODO: Replace fetchStudentMarks and deleteMark with Supabase queries after Supabase integration.

import { uploadUnitTestCSV } from "@/services/csvService";

export interface Mark {
    id: string;
    roll_no: string;
    subject: string;
    test_name: string;
    marks: number;
    max_marks: number;
    semester: string;
    uploaded_by: string;
    uploaded_at: string;
}

/**
 * Fetch all unit test marks for a given student roll number.
 * TODO: Replace with Supabase query:
 *   supabase.from('unit_test_marks').select('*').eq('roll_no', rollNo)
 */
export async function fetchStudentMarks(rollNo: string): Promise<Mark[]> {
    // TODO: Connect to Supabase backend
    console.log("fetchStudentMarks called for:", rollNo);
    return [];
}

/**
 * Upload marks from a CSV file. CSV format: roll_no,subject,marks,semester
 *
 * Calls the Python FastAPI backend (POST /upload/unit-test) via csvService.
 * Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local to enable.
 *
 * After Supabase integration:
 *   1. Upload file to storage: supabase.storage.from('marks-uploads').upload(path, file)
 *   2. Insert validated rows: supabase.from('unit_test_marks').insert(rows)
 */
export async function uploadMarksCSV(
    file: File,
    teacherId: string,
    subject: string,
    testName: string
): Promise<{ success: boolean; message: string; rowsInserted?: number }> {
    console.log("uploadMarksCSV called:", file.name, teacherId, subject, testName);

    const result = await uploadUnitTestCSV(file);

    if (!result.success && result.inserted === 0 && result.errors.length > 0) {
        // Configuration error or total failure
        return { success: false, message: result.errors[0] };
    }

    const message = result.failed > 0
        ? `Uploaded ${result.inserted} row(s). ${result.failed} row(s) skipped: ${result.errors.join("; ")}`
        : `Successfully uploaded ${result.inserted} row(s).`;

    return {
        success: result.inserted > 0,
        message,
        rowsInserted: result.inserted,
    };
}

/**
 * Delete a mark entry by ID.
 * TODO: supabase.from('unit_test_marks').delete().eq('id', markId)
 */
export async function deleteMark(markId: string): Promise<void> {
    // TODO: Connect to Supabase backend
    console.log("deleteMark called:", markId);
}
