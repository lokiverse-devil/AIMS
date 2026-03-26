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

export async function fetchNotices(branch?: string, year?: string): Promise<Notice[]> {
  let query = supabase.from('notices').select('*').order('created_at', { ascending: false })
  
  if (branch) {
    if (year) {
      // Matches specific combinations like "CSE – 1st Year", or broad ones like "CSE – All" / "All – All"
      query = query.or(`audience.ilike.%${branch} ${year}%,audience.ilike.%${branch} All%,audience.ilike.%All All%,audience.eq.General Campus`)
    } else {
      query = query.or(`audience.ilike.%${branch}%,audience.eq.General Campus,audience.ilike.%All%`)
    }
  }
  
  const { data, error } = await query
  if (error) { console.error('fetchNotices error:', error); return [] }
  return data ?? []
}

export async function postNotice(notice: {
  title: string; content?: string; audience: string
  priority?: 'Normal' | 'High'; posted_by: string
}): Promise<{ data: Notice | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('notices').insert({ ...notice, priority: notice.priority ?? 'Normal' }).select().single()
  if (error) return { data: null, error }
  return { data, error: null }
}

export async function updateNotice(
  id: string,
  updates: Partial<Pick<Notice, 'title' | 'content' | 'audience' | 'priority'>>,
): Promise<{ data: Notice | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('notices').update(updates).eq('id', id).select().single()
  if (error) return { data: null, error }
  return { data, error: null }
}

export async function deleteNotice(noticeId: string): Promise<void> {
  const { error } = await supabase.from('notices').delete().eq('id', noticeId)
  if (error) console.error('deleteNotice error:', error)
}
