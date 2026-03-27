import { supabase } from '@/lib/supabaseClient'

export interface SubjectItem {
  id: string
  code: string | null
  name: string
  semester: string
}

export interface BranchWithSubjects {
  code: string
  name: string
  subjects: SubjectItem[]
}

/**
 * Fetches all branches along with their associated subjects.
 * Uses Supabase's foreign key relationships for nested joining.
 */
export async function fetchBranchesAndSubjects(): Promise<BranchWithSubjects[]> {
  const { data, error } = await supabase
    .from('branches')
    .select(`
      code,
      name,
      subjects (
        id,
        code,
        name,
        semester
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching branches and subjects:', error)
    return []
  }

  // Ensure sorting of subjects by semester or name if needed
  return (data as BranchWithSubjects[]) || []
}

/**
 * Updates a teacher's assigned subjects array (stores subject names/IDs)
 */
export async function updateTeacherSubjects(teacherId: string, subjectsArray: string[]) {
  const { data, error } = await supabase
    .from('teachers')
    .update({ subjects: subjectsArray })
    .eq('id', teacherId)
    .select()

  if (error) {
    console.error('Error updating teacher subjects:', error)
    return { success: false, error }
  }

  return { success: true, data }
}
