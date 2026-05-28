'use client'

import { useAuth } from '@/context/auth-context'

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { status } = useAuth()

  if (status === 'loading') return null

  return <>{children}</>
}

export { AuthGuard }
