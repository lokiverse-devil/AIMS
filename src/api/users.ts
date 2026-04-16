import { supabase } from '@/lib/supabaseClient'

export interface UserProfile {
  id: string
  role: 'student' | 'teacher' | 'admin'
  roll_no?: string
  branch?: string
  name?: string
  department?: string
  semester?: string
  email?: string
  photo_url?: string
  phone?: string
  created_at: string
}

export interface Student {
  id?: string
  roll_no: string
  name: string
  semester: string
  branch: string
  phone?: string
  section?: string
  photo_url?: string
  email?: string
  created_at?: string
}

/**
 * Fetch a user's profile from the `users` table by their auth UUID.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('fetchUserProfile error:', error)
    return null
  }
  return data
}

/**
 * Update a user's profile in the `users` table.
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'role' | 'created_at'>>,
): Promise<{ data: UserProfile | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data, error: null }
}

/**
 * Update a student's profile in the `students` table (phone, photo_url, etc.)
 */
export async function updateStudentProfile(
  rollNo: string,
  updates: Partial<Pick<Student, 'phone' | 'photo_url' | 'section' | 'name' | 'email'>>,
): Promise<{ data: Student | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('roll_no', rollNo)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data, error: null }
}

/**
 * Update a teacher's profile in the `teachers` table (phone, photo_url, designation, etc.)
 */
export async function updateTeacherProfile(
  teacherId: string,
  updates: Partial<{ phone: string; photo_url: string; designation: string; name: string }>,
): Promise<{ data: any; error: Error | null }> {
  const { data, error } = await supabase
    .from('teachers')
    .update(updates)
    .eq('id', teacherId)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data, error: null }
}

/**
 * Fetch a list of students from the `students` table,
 * optionally filtered by department (branch) and/or semester.
 */
export async function fetchStudentList(
  department?: string,
  semester?: string,
): Promise<Student[]> {
  let query = supabase.from('students').select('*').order('roll_no')

  // Robust branch filtering: handles both 'CSE' and 'Computer Science Engineering'
  if (department) {
    const { getBranchLabel, getBranchKey } = await import('@/lib/constants')
    query = query.in('branch', [department, getBranchLabel(department), getBranchKey(department)])
  }
  
  if (semester && semester !== 'All') {
    const semNum = semester.replace(/\D/g, '')
    // Match both numeric "6" and ordinal "6th"/"6st"/"6nd"/"6rd" stored in DB
    const suffixes = ['', 'th', 'st', 'nd', 'rd']
    const orParts = suffixes.map(s => `semester.eq.${semNum}${s}`).join(',')
    query = query.or(orParts)
  }

  const { data, error } = await query
  if (error) {
    console.error('fetchStudentList error:', error)
    return []
  }
  return data ?? []
}

/**
 * Fetch a single student by roll number.
 */
export async function fetchStudentByRollNo(rollNo: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('roll_no', rollNo)
    .single()

  if (error) return null
  return data
}

/**
 * Upload a student enrollment CSV via the Python FastAPI backend.
 * 
 * CSV format: roll_no, name, semester, branch
 */
export async function uploadStudentsCSV(
  file: File,
  department: string
): Promise<{ success: boolean; message: string; rowsInserted?: number }> {
  try {
    const { uploadStudentCSV } = await import('@/services/csvService')
    const result = await uploadStudentCSV(file)

    if (!result.success && result.inserted === 0 && result.errors.length > 0) {
      return { success: false, message: result.errors[0] }
    }

    const message = result.failed > 0
      ? `Synchronized ${result.inserted} student(s). ${result.failed} records skipped: ${result.errors.join('; ')}`
      : `Successfully synchronized ${result.inserted} students for the ${department} department.`

    return {
      success: result.inserted > 0,
      message,
      rowsInserted: result.inserted
    }
  } catch (err) {
    return {
      success: false,
      message: 'Network error: Failed to reach the sync service.'
    }
  }
}
