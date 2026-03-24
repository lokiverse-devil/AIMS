import { supabase } from '@/lib/supabaseClient'

export interface Ticket {
  id: string
  student_id: string
  student_roll_no?: string
  category: string
  subject: string
  description?: string
  status: 'Pending' | 'In Progress' | 'Resolved'
  created_at: string
  updated_at?: string
}

/**
 * Fetch tickets based on user role.
 * - Students: see only their own tickets (filtered by student_id)
 * - Teachers: see all tickets in their department
 */
export async function fetchTickets(
  userId: string,
  role: 'student' | 'teacher',
): Promise<Ticket[]> {
  let query = supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (role === 'student') {
    query = query.eq('student_id', userId)
  }
  // Teachers see all tickets (RLS handles row-level filtering)

  const { data, error } = await query
  if (error) {
    console.error('fetchTickets error:', error)
    return []
  }
  return data ?? []
}

/**
 * Create a new ticket (student only).
 */
export async function createTicket(data: {
  student_id: string
  student_roll_no?: string
  category: string
  subject: string
  description?: string
}): Promise<{ data: Ticket | null; error: Error | null }> {
  const { data: inserted, error } = await supabase
    .from('tickets')
    .insert({
      ...data,
      status: 'Pending',
    })
    .select()
    .single()

  if (error) return { data: null, error }
  return { data: inserted, error: null }
}

/**
 * Submit a new complaint (alias for createTicket with better type safety).
 *
 * NOTE: Only students can mark their own tickets as Resolved.
 * Teachers can ONLY move tickets to "In Progress".
 */
export async function submitComplaint(complaint: {
  category: string
  subject: string
  description: string
  studentId: string
  studentRollNo: string
}): Promise<{ success: boolean; ticketId?: string; message: string }> {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      student_id: complaint.studentId,
      student_roll_no: complaint.studentRollNo,
      category: complaint.category,
      subject: complaint.subject,
      description: complaint.description,
      status: 'Pending',
    })
    .select('id')
    .single()

  if (error) return { success: false, message: error.message }
  return { success: true, ticketId: data.id, message: 'Ticket submitted successfully' }
}

/**
 * Update ticket status.
 *
 * IMPORTANT:
 *  - Teachers can ONLY set status to "In Progress". RLS enforces this server-side.
 *  - Only the student who submitted the ticket can mark it "Resolved".
 */
export async function updateTicketStatus(
  ticketId: string,
  status: 'Pending' | 'In Progress' | 'Resolved',
  updatedBy: string,
  role: 'student' | 'teacher',
): Promise<{ data: Ticket | null; error: Error | null }> {
  // Client-side guard: teachers cannot set Resolved
  if (role === 'teacher' && status === 'Resolved') {
    return {
      data: null,
      error: new Error('Teachers cannot mark tickets as Resolved. Only the student can.'),
    }
  }

  const { data, error } = await supabase
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single()

  if (error) return { data: null, error }
  return { data, error: null }
}

/**
 * Delete a ticket by ID (admin use only).
 */
export async function deleteTicket(ticketId: string): Promise<void> {
  const { error } = await supabase.from('tickets').delete().eq('id', ticketId)
  if (error) console.error('deleteTicket error:', error)
}
