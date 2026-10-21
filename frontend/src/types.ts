export type User = {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  provider: 'google' | 'email'
  hasPassword: boolean
  createdAt: string
}

export type AuthConfig = {
  googleEnabled: boolean
}

export type AuthResponse = {
  user: User
}

export type ApiErrorBody = {
  message?: string
  fields?: Record<string, string>
}
