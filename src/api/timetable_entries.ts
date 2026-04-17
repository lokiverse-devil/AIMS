import { supabase } from '@/lib/supabaseClient'

export interface TimetableEntry {
  id: string
  teacher_id: string
  teacher_name: string   // stored when teacher saves slot
  branch: string
  semester: string      // "1" | "2" | "3" | "4" | "5" | "6"
  day_of_week: string
  start_time: string
  end_time: string
  subject: string
  room: string
  class_name: string
  year: string          // "1" | "2" | "3" | "4"
  created_at: string
}

export type NewEntry = Omit<TimetableEntry, 'id' | 'created_at'>

/**
 * Fetch all timetable entries for a specific teacher (personalised schedule).
 */
export async function fetchTeacherTimetable(teacherId: string): Promise<TimetableEntry[]> {
  const { data, error } = await supabase
    .from('timetable_entries')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('day_of_week')
    .order('start_time')

  if (error) {
    console.error('fetchTeacherTimetable error:', error)
    return []
  }
  return data ?? []
}

/**
 * Fetch timetable entries for a class (by branch + year) — used by students.
 */
export async function fetchClassTimetable(
  branch: string,
  semester: string,
): Promise<TimetableEntry[]> {
  const { data, error } = await supabase
    .from('timetable_entries')
    .select('*')
    .eq('branch', branch)
    .eq('semester', semester)
    .order('day_of_week')
    .order('start_time')

  if (error) {
    console.error('fetchClassTimetable error:', error)
    return []
  }
  return data ?? []
}

/**
 * Insert a new timetable entry.
 */
export async function insertTimetableEntry(
  entry: NewEntry,
): Promise<{ data: TimetableEntry | null; error: Error | null }> {
  const { teacher_name, ...dbEntry } = entry as any;

  const { data, error } = await supabase
    .from('timetable_entries')
    .insert(dbEntry)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data: { ...data, teacher_name } as TimetableEntry, error: null }
}

/**
 * Update an existing timetable entry.
 */
export async function updateTimetableEntry(
  id: string,
  updates: Partial<Omit<TimetableEntry, 'id' | 'teacher_id' | 'created_at'>>,
): Promise<{ data: TimetableEntry | null; error: Error | null }> {
  const { teacher_name, ...dbUpdates } = updates as any;

  const { data, error } = await supabase
    .from('timetable_entries')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data: { ...data, teacher_name } as TimetableEntry, error: null }
}

/**
 * Delete a timetable entry by ID.
 */
export async function deleteTimetableEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('timetable_entries')
    .delete()
    .eq('id', id)
  if (error) console.error('deleteTimetableEntry error:', error)
}
