export async function getAllUsers(supabase: any, searchParams: URLSearchParams) {
  const role = searchParams.get('role')
  const branch = searchParams.get('branch')
  
  let query = supabase.from('users').select('*')
  
  if (role) query = query.eq('role', role)
  if (branch) query = query.eq('branch', branch)
  
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function updateUser(supabase: any, id: string, updates: any) {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}
