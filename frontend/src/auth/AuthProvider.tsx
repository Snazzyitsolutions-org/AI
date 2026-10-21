import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../lib/api'
import type { User } from '../types'
import { AuthContext } from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSession() {
      const [sessionResult, configResult] = await Promise.allSettled([
        authApi.getMe(),
        authApi.getConfig(),
      ])

      if (!active) return

      if (sessionResult.status === 'fulfilled') {
        setUser(sessionResult.value)
      }
      if (configResult.status === 'fulfilled') {
        setGoogleEnabled(configResult.value.googleEnabled)
      }

      setReady(true)
    }

    void loadSession()

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(
    async (input: { email: string; password: string; remember: boolean }) => {
      const nextUser = await authApi.login(input)
      setUser(nextUser)
    },
    [],
  )

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const nextUser = await authApi.register(input)
      setUser(nextUser)
    },
    [],
  )

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, ready, googleEnabled, login, register, logout }),
    [user, ready, googleEnabled, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
