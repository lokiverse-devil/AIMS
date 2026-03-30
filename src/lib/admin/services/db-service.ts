const ALLOWED_TABLES = ['users', 'students', 'teachers', 'branches', 'labs', 'teacher_keys']

export async function updateRecord(supabase: any, table: string, id: string, updates: any) {
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error(`Table ${table} is not permitted for generic updates.`)
  }
  
  const pkColumn = (table === 'students' && updates.roll_no && !id) ? 'roll_no' : 'id'
  const pkValue = (table === 'students' && updates.roll_no && !id) ? updates.roll_no : id
  
  if (!pkValue) throw new Error('Primary key value missing for the update query.')

  const { data, error } = await supabase.from(table).update(updates).eq(pkColumn, pkValue).select().single()
  if (error) throw new Error(error.message)
  return data
}
