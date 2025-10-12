import { User } from '@supabase/auth-helpers-nextjs'

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{
    data: any
    error: any
  }>
  signOut: () => Promise<{ error: any }>
}

export interface LoginFormData {
  email: string
  password: string
}