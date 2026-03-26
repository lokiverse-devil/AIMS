import { supabase, STORAGE_BUCKETS, SUPABASE_STORAGE_BASE } from '@/lib/supabaseClient'

export interface Resource {
  id: string
  title: string
  subject: string
  semester: string
  department: string
  file_url: string
  type: string
  size?: string
  uploaded_by: string
  created_at: string
}

export interface TimetableEntry {
  id: string
  branch: string
  year: string
  type: 'class' | 'lab'
  file_url: string
  uploaded_at: string
}

/**
 * Fetch resources filtered by department and/or semester.
 */
export async function fetchResources(
  department?: string,
  semester?: string,
  branch?: string,
): Promise<Resource[]> {
  let query = supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })

  // Filter by branch if provided, fallback to department
  if (branch) query = query.eq('department', branch)
  else if (department) query = query.eq('department', department)
  
  if (semester && semester !== 'All') {
    query = query.or(`semester.eq."${semester}",semester.eq.All`)
  }

  const { data, error } = await query
  if (error) {
    console.error('fetchResources error:', error)
    return []
  }
  return data ?? []
}

/**
 * Upload a resource file to Supabase Storage and insert a record in the DB.
 */
export async function uploadResource(
  file: File,
  metadata: {
    title: string
    subject: string
    semester: string
    department: string
    uploaded_by: string
  },
): Promise<{ data: Resource | null; error: Error | null }> {
  const path = `${metadata.department}/${metadata.semester}/${Date.now()}_${file.name}`

  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKETS.RESOURCES)
    .upload(path, file, { upsert: false })

  if (storageError) return { data: null, error: storageError }

  const publicUrl = `${SUPABASE_STORAGE_BASE}/${STORAGE_BUCKETS.RESOURCES}/${path}`

  const { data: inserted, error: dbError } = await supabase
    .from('resources')
    .insert({
      ...metadata,
      file_url: publicUrl,
      type: file.name.split('.').pop()?.toUpperCase() ?? 'FILE',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    })
    .select()
    .single()

  if (dbError) return { data: null, error: dbError }
  return { data: inserted, error: null }
}

/**
 * Get a public download URL for a resource file.
 */
export async function getResourceDownloadUrl(filename: string): Promise<string | null> {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.RESOURCES)
    .getPublicUrl(filename)
  return data.publicUrl ?? null
}

/**
 * Upload student list CSV via backend; also store the file in Supabase Storage.
 */
export async function uploadStudentCSV(
  file: File,
  department: string,
): Promise<{ success: boolean; message: string; rowsInserted?: number }> {
  // Archive the CSV to Supabase Storage
  const archivePath = `students/${department}/${Date.now()}_${file.name}`
  await supabase.storage
    .from(STORAGE_BUCKETS.RESOURCES)
    .upload(archivePath, file, { upsert: false })

  // Parse CSV client-side and upsert into students table
  const text = await file.text()
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())

  const required = ['roll_no', 'name', 'year', 'branch']
  const missing = required.filter((r) => !headers.includes(r))
  if (missing.length > 0) {
    return { success: false, message: `Missing columns: ${missing.join(', ')}` }
  }

  const rows = lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim())
    const row = Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
    
    // Normalize year
    if (row.year) {
      const y = row.year.toLowerCase()
      if (y.includes('1') || y.includes('fy')) row.year = '1st Year'
      else if (y.includes('2') || y.includes('sy')) row.year = '2nd Year'
      else if (y.includes('3') || y.includes('ty')) row.year = '3rd Year'
    }
    return row
  })

  const validRows = rows.filter(
    (r) => r.roll_no && r.name && r.year && r.branch,
  )

  if (validRows.length === 0) {
    return { success: false, message: 'No valid rows found in CSV' }
  }

  const { error } = await supabase.from('students').upsert(validRows, {
    onConflict: 'roll_no',
  })

  if (error) return { success: false, message: error.message }
  return {
    success: true,
    message: `Inserted/updated ${validRows.length} student record(s)`,
    rowsInserted: validRows.length,
  }
}

/**
 * Fetch timetable public URL for a branch + year.
 */
export async function fetchTimetable(
  branch: string,
  year: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('timetables')
    .select('file_url')
    .eq('branch', branch)
    .eq('year', year)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data.file_url
}

/**
 * Upload a timetable PDF/image to Supabase Storage and record in DB.
 */
export async function uploadTimetable(
  file: File,
  branch: string,
  year: string,
  type: 'class' | 'lab',
): Promise<{ success: boolean; url?: string }> {
  const path = `${branch}/${year}/${type}_${Date.now()}_${file.name}`

  const { error: storageError } = await supabase.storage
    .from('timetables')
    .upload(path, file, { upsert: true })

  if (storageError) return { success: false }

  const { data: urlData } = supabase.storage
    .from('timetables')
    .getPublicUrl(path)

  const publicUrl = urlData.publicUrl

  await supabase.from('timetables').insert({
    branch,
    year,
    type,
    file_url: publicUrl,
    uploaded_at: new Date().toISOString(),
  })

  return { success: true, url: publicUrl }
}
