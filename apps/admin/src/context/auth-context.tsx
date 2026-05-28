'use client'

import type { IAdminUser } from '@pkg/types'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { apiFetch, setAccessToken } from '@/lib/api-client'

type IAuthContextValue = {
  user: IAdminUser | null
  accessToken: string | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
  requestMagicLink(email: string): Promise<void>
  forgotPassword(email: string): Promise<void>
  resetPassword(token: string, newPassword: string): Promise<void>
  updateProfile(data: { fullName?: string; avatarUrl?: string }): Promise<void>
  changePassword(currentPassword: string, newPassword: string): Promise<void>
  setTokenFromCallback(token: string): void
}

const AuthContext = createContext<IAuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IAdminUser | null>(null)
  const [accessToken, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading')
  const channel = useRef<BroadcastChannel | null>(null)

  const storeToken = useCallback((token: string | null) => {
    setToken(token)
    setAccessToken(token)
  }, [])

  // BroadcastChannel: share token across tabs
  useEffect(() => {
    channel.current = new BroadcastChannel('admin_auth')
    channel.current.onmessage = (
      e: MessageEvent<{ type: string; token?: string }>
    ) => {
      if (e.data.type === 'token' && e.data.token) {
        storeToken(e.data.token)
      } else if (e.data.type === 'logout') {
        storeToken(null)
        setUser(null)
        setStatus('unauthenticated')
      }
    }
    return () => channel.current?.close()
  }, [storeToken])

  // Silent refresh on mount
  useEffect(() => {
    ;(async () => {
      try {
        const data = await apiFetch<{ accessToken: string }>(
          '/api/admin/auth/refresh',
          {
            method: 'POST',
            credentials: 'include',
            skipRetry: true,
          } as RequestInit & { skipRetry: boolean }
        )
        storeToken(data.accessToken)
        channel.current?.postMessage({ type: 'token', token: data.accessToken })
        const me = await apiFetch<IAdminUser>('/api/admin/auth/me')
        setUser(me)
        setStatus('authenticated')
      } catch {
        storeToken(null)
        setStatus('unauthenticated')
        document.cookie = 'session_exists=; Max-Age=0; path=/'
        const protectedPaths = [
          '/dashboard',
          '/profile',
          '/users',
          '/roles',
          '/permissions',
        ]
        if (
          protectedPaths.some((p) => window.location.pathname.startsWith(p))
        ) {
          window.location.replace('/login')
        }
      }
    })()
  }, [storeToken])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<{ accessToken: string; user: IAdminUser }>(
        '/api/admin/auth/login',
        {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        }
      )
      storeToken(data.accessToken)
      setUser(data.user)
      setStatus('authenticated')
      channel.current?.postMessage({ type: 'token', token: data.accessToken })
    },
    [storeToken]
  )

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // best effort
    }
    storeToken(null)
    setUser(null)
    setStatus('unauthenticated')
    channel.current?.postMessage({ type: 'logout' })
  }, [storeToken])

  const requestMagicLink = useCallback(async (email: string) => {
    await apiFetch('/api/admin/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    await apiFetch('/api/admin/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }, [])

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      await apiFetch('/api/admin/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      })
    },
    []
  )

  const updateProfile = useCallback(
    async (data: { fullName?: string; avatarUrl?: string }) => {
      const updated = await apiFetch<IAdminUser>('/api/admin/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      setUser(updated)
    },
    []
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await apiFetch('/api/admin/auth/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
    },
    []
  )

  const setTokenFromCallback = useCallback(
    (token: string) => {
      storeToken(token)
      channel.current?.postMessage({ type: 'token', token })
      apiFetch<IAdminUser>('/api/admin/auth/me')
        .then((me) => {
          setUser(me)
          setStatus('authenticated')
        })
        .catch(() => {
          storeToken(null)
          setStatus('unauthenticated')
        })
    },
    [storeToken]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        status,
        login,
        logout,
        requestMagicLink,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        setTokenFromCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): IAuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { ApiError } from '@/lib/api-client'
