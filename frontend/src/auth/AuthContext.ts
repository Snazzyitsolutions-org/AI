import { createContext, useContext } from 'react'
import type { User } from '../types'

export type AuthContextValue = {
  user: User | null
  ready: boolean
  googleEnabled: boolean
  login: (input: { email: string; password: string; remember: boolean }) => Promise<void>
  register: (input: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
