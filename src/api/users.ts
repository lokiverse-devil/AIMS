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
  created_at: string
}

export interface Student {
  id?: string
  roll_no: string
  name: string
  year: string
  branch: string
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
 * Fetch a list of students from the `students` table,
 * optionally filtered by department (branch) and/or year.
 */
export async function fetchStudentList(
  department?: string,
  year?: string,
): Promise<Student[]> {
  let query = supabase.from('students').select('*').order('roll_no')

  if (department) query = query.eq('branch', department)
  if (year) query = query.eq('year', year)

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
