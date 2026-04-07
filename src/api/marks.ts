import { supabase } from '@/lib/supabaseClient'
import { uploadUnitTestCSV } from '@/services/csvService'

export interface Mark {
  id: string
  roll_no: string
  subject: string
  test_name: string
  marks: number
  max_marks: number
  semester: string
  uploaded_by: string
  uploaded_at: string
}

/**
 * Fetch all unit test marks for a given student roll number from Supabase.
 */
export async function fetchStudentMarks(rollNo: string): Promise<Mark[]> {
  const { data, error } = await supabase
    .from('unit_test_marks')
    .select('*')
    .eq('roll_no', rollNo)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('fetchStudentMarks error:', error)
    return []
  }
  return data ?? []
}

/**
 * Upload marks from a CSV file via the Python FastAPI backend.
 * The backend validates+parses the CSV and inserts rows into Supabase.
 *
 * CSV format: roll_no,subject,marks,semester
 */
export async function uploadMarksCSV(
  file: File,
  config: {
    teacher_id: string
    subject: string
    test_name: string
  },
): Promise<{ success: boolean; message: string; rowsInserted?: number }> {
  const { teacher_id, subject, test_name } = config
  const result = await uploadUnitTestCSV(file)

  if (!result.success && result.inserted === 0 && result.errors.length > 0) {
    return { success: false, message: result.errors[0] }
  }

  // After backend inserts rows, store the metadata via direct Supabase update
  if (result.inserted > 0 && test_name && subject) {
    await supabase
      .from('unit_test_marks')
      .update({ test_name, uploaded_by: teacher_id })
      .is('test_name', null)
  }

  const message =
    result.failed > 0
      ? `Uploaded ${result.inserted} row(s). ${result.failed} records skipped: ${result.errors.join('; ')}`
      : `Successfully uploaded ${result.inserted} row(s) for ${test_name}.`

  return {
    success: result.inserted > 0,
    message,
    rowsInserted: result.inserted,
  }
}

/**
 * Insert marks rows directly via Supabase (teacher-side, bypasses backend).
 * Useful when inserting programmatically without a CSV upload.
 */
export async function insertMarks(
  rows: Omit<Mark, 'id' | 'uploaded_at'>[],
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('unit_test_marks').insert(rows)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Delete a mark entry by its UUID.
 */
export async function deleteMark(markId: string): Promise<void> {
  const { error } = await supabase
    .from('unit_test_marks')
    .delete()
    .eq('id', markId)
  if (error) console.error('deleteMark error:', error)
}

/**
 * Fetch marks for all students in a subject/semester (teacher view).
 */
export async function fetchMarksBySubject(
  subject: string,
  semester: string,
): Promise<Mark[]> {
  const { data, error } = await supabase
    .from('unit_test_marks')
    .select('*')
    .eq('subject', subject)
    .eq('semester', semester)
    .order('roll_no')
  if (error) {
    console.error('fetchMarksBySubject error:', error)
    return []
  }
  return data ?? []
}
