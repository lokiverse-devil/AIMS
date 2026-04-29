import { supabase } from '@/lib/supabaseClient'

export interface PendingRegistration {
  id: string
  roll_no: string
  name: string
  semester: string
  branch: string
  uploaded_by?: string
  uploaded_at?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at?: string
}

/**
 * Fetch all pending registrations, optionally filtered by branch/semester/status.
 */
export async function fetchPendingRegistrations(
  filters?: {
    branch?: string
    semester?: string
    status?: 'pending' | 'approved' | 'rejected'
  }
): Promise<PendingRegistration[]> {
  let query = supabase
    .from('pending_registrations')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.branch) {
    query = query.eq('branch', filters.branch)
  }
  if (filters?.semester && filters.semester !== 'All') {
    query = query.eq('semester', filters.semester)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) {
    console.error('fetchPendingRegistrations error:', error)
    return []
  }
  return data ?? []
}

/**
 * Upload student CSV data into the pending_registrations table.
 * Parses the CSV client-side and upserts rows.
 *
 * Expected CSV columns: roll_no, name, semester, branch
 */
export async function uploadStudentCSVToPending(
  file: File,
  uploadedBy?: string,
): Promise<{ success: boolean; message: string; rowsInserted?: number }> {
  const text = await file.text()
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())

  const required = ['roll_no', 'name', 'semester', 'branch']
  const missing = required.filter((r) => !headers.includes(r))
  if (missing.length > 0) {
    return { success: false, message: `Missing columns: ${missing.join(', ')}` }
  }

  const rows = lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim())
    const row: Record<string, string> = Object.fromEntries(
      headers.map((h, i) => [h, vals[i] ?? ''])
    )

    // Normalize semester to digit only
    if (row.semester) {
      const s = row.semester.replace(/\D/g, '')
      row.semester = ['1', '2', '3', '4', '5', '6'].includes(s) ? s : ''
    }
    return row
  })

  const validRows = rows.filter(
    (r) => r.roll_no && r.name && r.semester && r.branch,
  )

  if (validRows.length === 0) {
    return { success: false, message: 'No valid rows found in CSV' }
  }

  // Add metadata to each row
  const rowsToInsert = validRows.map((r) => ({
    roll_no: r.roll_no,
    name: r.name,
    semester: r.semester,
    branch: r.branch,
    status: 'pending' as const,
    ...(uploadedBy ? { uploaded_by: uploadedBy } : {}),
  }))

  const { error } = await supabase
    .from('pending_registrations')
    .upsert(rowsToInsert, { onConflict: 'roll_no' })

  if (error) return { success: false, message: error.message }
  return {
    success: true,
    message: `${validRows.length} student(s) added to pending registrations.`,
    rowsInserted: validRows.length,
  }
}

/**
 * Update the status of a pending registration (approve/reject).
 */
export async function updateRegistrationStatus(
  id: string,
  status: 'approved' | 'rejected',
): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('pending_registrations')
    .update({ status })
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  return { success: true, message: `Registration ${status} successfully.` }
}

/**
 * Approve a pending registration and move the student to the students table.
 */
export async function approveAndMoveToStudents(
  id: string,
): Promise<{ success: boolean; message: string }> {
  // Fetch the pending registration
  const { data: registration, error: fetchError } = await supabase
    .from('pending_registrations')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !registration) {
    return { success: false, message: 'Registration not found.' }
  }

  // Insert into students table
  const { error: insertError } = await supabase.from('students').upsert(
    {
      roll_no: registration.roll_no,
      name: registration.name,
      semester: registration.semester,
      branch: registration.branch,
    },
    { onConflict: 'roll_no' },
  )

  if (insertError) {
    return { success: false, message: `Failed to add student: ${insertError.message}` }
  }

  // Update pending registration status
  const { error: updateError } = await supabase
    .from('pending_registrations')
    .update({ status: 'approved' })
    .eq('id', id)

  if (updateError) {
    return { success: false, message: `Student added but status update failed: ${updateError.message}` }
  }

  return { success: true, message: `${registration.name} approved and added to student registry.` }
}

/**
 * Bulk approve all pending registrations and move them to students table.
 */
export async function bulkApproveRegistrations(
  ids: string[],
): Promise<{ success: boolean; message: string; approved: number }> {
  let approved = 0

  for (const id of ids) {
    const result = await approveAndMoveToStudents(id)
    if (result.success) approved++
  }

  return {
    success: approved > 0,
    message: `${approved} of ${ids.length} registration(s) approved.`,
    approved,
  }
}

/**
 * Delete a pending registration.
 */
export async function deletePendingRegistration(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase
    .from('pending_registrations')
    .delete()
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  return { success: true, message: 'Registration deleted.' }
}
