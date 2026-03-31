export async function getAllKeys(supabase: any) {
  const { data: keys, error } = await supabase.from('teacher_keys').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  const userIds = Array.from(new Set(keys.filter((k: any) => k.used_by).map((k: any) => k.used_by)));
  let usersMap: Record<string, string> = {};
  
  if (userIds.length > 0) {
    const { data: users, error: userError } = await fallbackFetchUsers(supabase, userIds as string[]);
    if (!userError && users) {
      users.forEach((u: any) => { usersMap[u.id] = u.name; });
    }
  }

  return keys.map((k: any) => ({
    ...k,
    users: k.used_by && usersMap[k.used_by] ? { name: usersMap[k.used_by] } : null
  }));
}

async function fallbackFetchUsers(supabase: any, userIds: string[]) {
  return await supabase.from('teachers').select('id, name').in('id', userIds);
}

export async function createKey(supabase: any, adminId: string, customKey?: string) {
  const shortRandom = Math.random().toString(36).substring(2, 6).toUpperCase()
  const keyToUse = customKey || `TEACH-${shortRandom}`
  const { data, error } = await supabase.from('teacher_keys').insert({
    key: keyToUse,
    used: false
  }).select().single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function updateKeyStatus(supabase: any, id: string, updates: { used?: boolean; used_by?: string | null }) {
  const { data, error } = await supabase.from('teacher_keys').update(updates).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteKey(supabase: any, id: string) {
  const { error } = await supabase.from('teacher_keys').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}
