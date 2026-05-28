'use client'

import type { IApiError } from '@pkg/types'
import { Button, Heading } from '@pkg/ui'
import { parseAsString, useQueryState } from 'nuqs'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Suspense, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { useAuth } from '@/context/auth-context'

const MagicLinkVerifyInner = () => {
  const { setTokenFromCallback } = useAuth()
  const router = useRouter()
  const [token] = useQueryState('token', parseAsString)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ accessToken: string }>(
        `/api/website/auth/magic-link/verify?token=${encodeURIComponent(token)}`,
        { method: 'POST', credentials: 'include' }
      )
      setTokenFromCallback(data.accessToken)
      router.push('/dashboard')
    } catch (e) {
      setError(handleException(e as IApiError, { showToast: false }))
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="border-border bg-background shadow-shadow flex flex-col gap-4 rounded-xl border p-8 shadow-sm">
        <Heading as="h1" size="sm" className="text-center">
          Invalid link
        </Heading>
        <div className="border-destructive/30 bg-destructive/10 flex flex-col gap-1 rounded-lg border p-4">
          <p className="text-body-sm text-destructive">
            This magic link is missing a token. Please request a new one.
          </p>
        </div>
        <Button variant="outline-secondary" asChild className="w-full">
          <Link href="/magic-link">Request a new link</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="border-border bg-background shadow-shadow flex flex-col gap-4 rounded-xl border p-8 shadow-sm">
      <h1 className="text-heading-sm text-foreground text-center">
        Confirm sign in
      </h1>
      <p className="text-muted-foreground text-body-md text-center">
        Click the button below to complete your sign in.
      </p>
      {error && (
        <div className="border-destructive/30 bg-destructive/10 flex flex-col gap-1 rounded-lg border p-4">
          <p className="text-body-sm text-destructive">{error}</p>
        </div>
      )}
      <Button className="w-full" onClick={confirm} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
      <Button variant="ghost-secondary" asChild className="w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  )
}

const MagicLinkVerifyPage = () => {
  return (
    <Suspense>
      <MagicLinkVerifyInner />
    </Suspense>
  )
}

export default MagicLinkVerifyPage
