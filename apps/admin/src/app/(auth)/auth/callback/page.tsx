'use client'

import { useRouter } from 'next/navigation'

import { useEffect } from 'react'

import { useAuth } from '@/context/auth-context'

const CallbackPage = () => {
  const { setTokenFromCallback } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const token = params.get('token')

    history.replaceState(null, '', window.location.pathname)

    if (token) {
      setTokenFromCallback(token)
      router.push('/dashboard')
    } else {
      router.push('/auth/error?reason=oauth_failed')
    }
  }, [setTokenFromCallback, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm">Signing you in…</p>
      </div>
    </div>
  )
}

export default CallbackPage
