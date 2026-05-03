import { supabase } from '@/lib/supabaseClient'

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
 * Upload marks from a CSV file directly via Supabase (bypassing backend).
 * Parses the CSV on the client side and inserts valid rows.
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
  try {
    const text = await file.text()
    // Handle both Windows \r\n and Unix \n newlines
    const lines = text.split(/\r?\n/)
    if (lines.length < 2) {
      return { success: false, message: 'CSV file is empty or missing headers.' }
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const required = ['roll_no', 'subject', 'marks', 'semester']
    const missing = required.filter((r) => !headers.includes(r))
    
    if (missing.length > 0) {
      return { success: false, message: `Missing required columns: ${missing.join(', ')}` }
    }

    const rowsToInsert: Omit<Mark, 'id' | 'uploaded_at'>[] = []
    const errors: string[] = []
    let failed = 0

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      // Handle simple CSV splitting (doesn't handle commas within quotes, but fine for basic marks)
      const values = lines[i].split(',').map((v) => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => {
        row[h] = values[idx] || ''
      })

      const roll_no = row['roll_no']
      const subject = row['subject']
      const marks_raw = row['marks']
      const semester = row['semester']

      if (!roll_no) { errors.push(`Row ${i + 1}: roll_no is empty`); failed++; continue }
      if (!subject) { errors.push(`Row ${i + 1}: subject is empty`); failed++; continue }
      if (!semester) { errors.push(`Row ${i + 1}: semester is empty`); failed++; continue }

      const marks_value = parseInt(marks_raw, 10)
      if (isNaN(marks_value) || marks_value < 0) {
        errors.push(`Row ${i + 1}: marks must be a valid non-negative integer`); failed++; continue
      }

      rowsToInsert.push({
        roll_no,
        subject,
        marks: marks_value,
        semester,
        test_name: config.test_name,
        uploaded_by: config.teacher_id,
        max_marks: 20 // Default max marks for unit tests if not specified in CSV
      })
    }

    if (rowsToInsert.length === 0) {
      return { 
        success: false, 
        message: errors.length > 0 ? errors[0] : 'No valid records found in the CSV.' 
      }
    }

    // Insert directly using the Supabase client
    const { error } = await supabase.from('unit_test_marks').insert(rowsToInsert)

    if (error) {
      return { success: false, message: `Database error: ${error.message}` }
    }

    const inserted = rowsToInsert.length
    const message = failed > 0
      ? `Uploaded ${inserted} row(s). ${failed} records skipped: ${errors.join('; ')}`
      : `Successfully uploaded ${inserted} row(s) for ${config.test_name}.`

    return { success: true, message, rowsInserted: inserted }
  } catch (err) {
    return {
      success: false,
      message: `Failed to process CSV: ${err instanceof Error ? err.message : String(err)}`
    }
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
