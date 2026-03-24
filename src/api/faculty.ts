import { supabase, STORAGE_BUCKETS, SUPABASE_STORAGE_BASE } from '@/lib/supabaseClient'

export interface Faculty {
  id: string
  name: string
  department: string
  subjects: string[]
  email: string
  designation?: string
  video_filename?: string
  created_at?: string
}

/**
 * Fetch all faculty members in a given department.
 */
export async function fetchFacultyByDepartment(department: string): Promise<Faculty[]> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('department', department)
    .order('name')

  if (error) {
    console.error('fetchFacultyByDepartment error:', error)
    return []
  }
  return data ?? []
}

/**
 * Fetch a single faculty member by their UUID.
 */
export async function fetchFacultyById(id: string): Promise<Faculty | null> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

/**
 * Get the public URL for a faculty introduction video from Supabase Storage.
 */
export async function fetchFacultyVideoUrl(filename: string): Promise<string | null> {
  if (!filename) return null
  return `${SUPABASE_STORAGE_BASE}/${STORAGE_BUCKETS.FACULTY_VIDEOS}/${filename}`
}

/**
 * Upload a faculty introduction video to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadFacultyVideo(
  file: File,
  facultyId: string,
): Promise<{ success: boolean; url?: string }> {
  const filename = `${facultyId}_${Date.now()}.${file.name.split('.').pop()}`

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.FACULTY_VIDEOS)
    .upload(filename, file, { upsert: true })

  if (error) return { success: false }

  const url = `${SUPABASE_STORAGE_BASE}/${STORAGE_BUCKETS.FACULTY_VIDEOS}/${filename}`

  // Update teacher record with video filename
  await supabase
    .from('teachers')
    .update({ video_filename: filename })
    .eq('id', facultyId)

  return { success: true, url }
}
