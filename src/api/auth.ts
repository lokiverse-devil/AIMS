import { supabase } from '@/lib/supabaseClient'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupStudentData {
  name: string
  rollNumber: string
  branch: string
  semester: string
  email: string
  password: string
  role: 'student'
}

export interface SignupTeacherData {
  name: string
  department: string
  email: string
  password: string
  teacherAccessKey: string
  role: 'teacher'
}

export interface UserProfile {
  id: string
  role: 'student' | 'teacher' | 'admin'
  roll_no?: string
  branch?: string
  name?: string
  department?: string
  subjects?: string[]
  semester?: string
  photo_url?: string
  phone?: string
  created_at: string
}

/**
 * Sign in with email + password via Supabase Auth.
 * Returns the user and their role from the `users` table.
 */
export async function loginUser(credentials: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })
  if (error) return { data: null, error }

  // Fetch role from users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError) return { data: null, error: profileError }
  return { data: { user: data.user, session: data.session, profile }, error: null }
}

/**
 * Sign up a student: creates Supabase Auth user, then inserts into
 * `users` (role + roll_no + branch) and `students` tables.
 */
export async function signupStudent(formData: SignupStudentData) {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { name: formData.name, role: 'student' },
    },
  })
  if (error) return { data: null, error }
  if (!data.user) return { data: null, error: new Error('User creation failed') }

  const userId = data.user.id

  // Insert into users profile table
  const { error: usersError } = await supabase.from('users').insert({
    id: userId,
    role: 'student',
    roll_no: formData.rollNumber,
    branch: formData.branch,
  })
  if (usersError) return { data: null, error: usersError }

  // Insert into students table
  const { error: studentsError } = await supabase.from('students').insert({
    id: userId,
    roll_no: formData.rollNumber,
    name: formData.name,
    branch: formData.branch,
    year: formData.semester,
  })
  if (studentsError) return { data: null, error: studentsError }

  return { data, error: null }
}

/**
 * Sign up a teacher: validates teacher access key from `teacher_keys` table,
 * creates Supabase Auth user, then inserts into `users` and `teachers` tables.
 */
export async function signupTeacher(formData: SignupTeacherData) {
  // Validate teacher access key
  const { data: keyData, error: keyError } = await supabase
    .from('teacher_keys')
    .select('id, used')
    .eq('key', formData.teacherAccessKey)
    .single()

  if (keyError || !keyData) {
    return { data: null, error: new Error('Invalid teacher access key') }
  }
  if (keyData.used) {
    return { data: null, error: new Error('Teacher access key has already been used') }
  }

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { name: formData.name, role: 'teacher' },
    },
  })
  if (error) return { data: null, error }
  if (!data.user) return { data: null, error: new Error('User creation failed') }

  const userId = data.user.id

  // Insert into users profile table
  const { error: usersError } = await supabase.from('users').insert({
    id: userId,
    role: 'teacher',
    branch: formData.department,
  })
  if (usersError) return { data: null, error: usersError }

  // Insert into teachers table
  const { error: teachersError } = await supabase.from('teachers').insert({
    id: userId,
    name: formData.name,
    department: formData.department,
    subjects: [],
    email: formData.email,
  })
  if (teachersError) return { data: null, error: teachersError }

  // Mark access key as used
  await supabase.from('teacher_keys').update({ used: true }).eq('key', formData.teacherAccessKey)

  return { data, error: null }
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get the currently authenticated user along with their profile from `users` table.
 *
 * Uses getSession() first (reads localStorage, no network race) instead of getUser()
 * which validates against the API on every call and can fail during initial page load.
 */
export async function getCurrentUser(): Promise<{ user: UserProfile & { email?: string } } | null> {
  // getSession() restores from localStorage instantly — avoids race condition on page mount
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const user = session.user

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // If name, photo_url or phone is missing from users (old user or not yet synced),
  // try to fetch it from student/teacher table
  if (!profile.name || !profile.photo_url || !profile.phone) {
    if (profile.role === 'student' && profile.roll_no) {
      const { data: sd } = await supabase.from('students').select('name, photo_url, phone').eq('roll_no', profile.roll_no).single()
      if (sd) {
        profile.name = sd.name || profile.name
        profile.photo_url = sd.photo_url || profile.photo_url
        profile.phone = sd.phone || profile.phone
      }
    } else if (profile.role === 'teacher') {
      const { data: td } = await supabase.from('teachers').select('name, photo_url, phone').eq('id', profile.id).single()
      if (td) {
        profile.name = td.name || profile.name
        profile.photo_url = td.photo_url || profile.photo_url
        profile.phone = td.phone || profile.phone
      }
    }
  }

  // Fallback to auth metadata name if not in database
  if (!profile.name && user.user_metadata?.name) {
    profile.name = user.user_metadata.name;
  }

  return { user: { ...profile, email: user.email } }
}

/**
 * Listen to auth state changes (login/logout events).
 */
export function onAuthStateChange(callback: (user: UserProfile | null) => void) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null)
      return
    }
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    callback(profile ?? null)
  })
}
