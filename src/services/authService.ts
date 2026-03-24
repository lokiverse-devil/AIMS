import { loginUser, logoutUser, getCurrentUser } from '@/api/auth'

export const AuthService = {
  login: async (email: string, password: string) => {
    const { data, error } = await loginUser({ email, password })
    if (error) return { success: false, message: error.message, data: null }
    return { success: true, message: 'Login successful', data }
  },

  logout: async () => {
    const { error } = await logoutUser()
    return { success: !error, message: error?.message }
  },

  getCurrentUser: async () => {
    return await getCurrentUser()
  },
}
