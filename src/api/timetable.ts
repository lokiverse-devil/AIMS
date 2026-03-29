import { supabase } from '@/lib/supabaseClient'

export interface Notice {
  id: string
  title: string
  content?: string
  audience?: string // legacy text
  target_branch?: string
  target_type?: 'Semester' | 'Year' | 'All' | string
  target_value?: string
  priority: 'Normal' | 'High'
  posted_by?: string
  created_at: string
}

export async function fetchNotices(branch?: string, semester?: string): Promise<Notice[]> {
  const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false })
  if (error) { console.error('fetchNotices error:', error); return [] }
  if (!data) return []

  // No filters -> return all
  if (!branch) return data

  let year = ''
  if (semester) {
    const semNum = parseInt(semester)
    if (!isNaN(semNum)) year = Math.ceil(semNum / 2).toString()
  }

  return data.filter(notice => {
    // 1. Legacy notices without structured targets
    if (!notice.target_branch) {
      const aud = notice.audience || ''
      if (aud.includes('All') || aud.includes('General')) return true
      if (branch && aud.includes(branch)) {
        if (!semester) return true
        // Try parsing year out of 'CSE - 2nd Year' legacy text
        if (aud.includes(`${year}nd Year`) || aud.includes(`${year}st Year`) || aud.includes(`${year}rd Year`) || aud.includes(`${year}th Year`)) return true
      }
      return false
    }

    // 2. Structured target notices
    const branchMatch = notice.target_branch === 'All' || notice.target_branch === branch
    if (!branchMatch) return false

    if (notice.target_type === 'All') return true
    if (semester && notice.target_type === 'Semester' && notice.target_value === semester) return true
    if (year && notice.target_type === 'Year' && notice.target_value === year) return true

    return false
  })
}

export async function postNotice(notice: Omit<Notice, 'id' | 'created_at' | 'audience'>): Promise<{ data: Notice | null; error: Error | null }> {
  // We keep 'audience' legacy column fallback as JSON string representation for safety in DB checks if needed
  const fallbackAudience = `${notice.target_branch} - ${notice.target_type}: ${notice.target_value}`
  
  const { data, error } = await supabase
    .from('notices').insert({ ...notice, audience: fallbackAudience, priority: notice.priority ?? 'Normal' }).select().single()
  if (error) return { data: null, error }
  return { data, error: null }
}

export async function updateNotice(
  id: string,
  updates: Partial<Pick<Notice, 'title' | 'content' | 'target_branch' | 'target_type' | 'target_value' | 'priority'>>,
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

