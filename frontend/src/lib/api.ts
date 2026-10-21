import type { ApiErrorBody, AuthConfig, AuthResponse, User } from '../types'

export class ApiError extends Error {
  status: number
  fields?: Record<string, string>

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response

  try {
    response = await fetch(path, {
      ...init,
      headers,
      credentials: 'include',
    })
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0)
  }

  let body: unknown = null

  if (response.status !== 204) {
    const text = await response.text()
    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        body = null
      }
    }
  }

  if (!response.ok) {
    const errorBody = (body ?? {}) as ApiErrorBody
    throw new ApiError(
      errorBody.message || 'Something went wrong. Please try again.',
      response.status,
      errorBody.fields,
    )
  }

  return body as T
}

export const authApi = {
  getConfig() {
    return request<AuthConfig>('/api/auth/config')
  },

  async getMe(): Promise<User | null> {
    try {
      const response = await request<AuthResponse>('/api/auth/me')
      return response.user
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null
      }
      throw error
    }
  },

  async login(input: { email: string; password: string; remember: boolean }) {
    const response = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return response.user
  },

  async register(input: { name: string; email: string; password: string }) {
    const response = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return response.user
  },

  async logout() {
    await request<void>('/api/auth/logout', { method: 'POST' })
  },
}

export const GOOGLE_START_URL = '/api/auth/google/start'

export const GOOGLE_NOT_CONFIGURED_MESSAGE =
  'Google sign-in is not configured yet. Add your Google OAuth credentials in backend/.env and restart the server.'
