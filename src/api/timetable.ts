import { supabase } from '@/lib/supabaseClient'

export interface Notice {
  id: string
  title: string
  content?: string
  audience: string
  priority: 'Normal' | 'High'
  posted_by?: string
  created_at: string
}

/**
 * Fetch all notices, ordered newest first.
 * Optionally filter by audience (e.g. "CSE All Years").
 */
export async function fetchNotices(audience?: string): Promise<Notice[]> {
  let query = supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  if (audience) query = query.eq('audience', audience)

  const { data, error } = await query
  if (error) {
    console.error('fetchNotices error:', error)
    return []
  }
  return data ?? []
}

/**
 * Post a new notice (teacher/admin only).
 */
export async function postNotice(notice: {
  title: string
  content?: string
  audience: string
  priority?: 'Normal' | 'High'
  posted_by: string
}): Promise<{ data: Notice | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('notices')
    .insert({
      ...notice,
      priority: notice.priority ?? 'Normal',
    })
    .select()
    .single()

  if (error) return { data: null, error }
  return { data, error: null }
}

/**
 * Delete a notice by ID.
 */
export async function deleteNotice(noticeId: string): Promise<void> {
  const { error } = await supabase.from('notices').delete().eq('id', noticeId)
  if (error) console.error('deleteNotice error:', error)
}
