'use client'

import type { IApiError } from '@pkg/types'
import { Button, Heading } from '@pkg/ui'
import { parseAsString, useQueryState } from 'nuqs'

import Link from 'next/link'

import { Suspense, useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

const VerifyEmailInner = () => {
  const [token] = useQueryState('token', parseAsString)

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const verify = async () => {
      try {
        await apiFetch(
          `/api/website/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: 'POST',
            credentials: 'include',
          }
        )
        setSuccess(true)
      } catch (e) {
        setError(handleException(e as IApiError, { showToast: false }))
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [token])

  if (!token) {
    return (
      <div className="border-border bg-background shadow-shadow flex flex-col gap-6 rounded-xl border p-8 shadow-sm">
        <Heading as="h1" size="sm" className="text-center">
          Invalid link
        </Heading>
        <p className="text-destructive text-body-md text-center">
          This verification link is missing a token. Please register again or
          contact support.
        </p>
        <Button variant="outline-secondary" asChild className="w-full">
          <Link href="/register">Back to register</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="border-border bg-background shadow-shadow flex flex-col gap-6 rounded-xl border p-8 shadow-sm">
        <Heading as="h1" size="sm" className="text-center">
          Verifying your email…
        </Heading>
        <p className="text-muted-foreground text-body-md text-center">
          Please wait a moment.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="border-border bg-background shadow-shadow flex flex-col gap-6 rounded-xl border p-8 shadow-sm">
        <Heading as="h1" size="sm" className="text-center">
          Email verified
        </Heading>
        <p className="text-muted-foreground text-body-md text-center">
          Your email address has been verified successfully. You can now sign in
          to your account.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="border-border bg-background shadow-shadow flex flex-col gap-6 rounded-xl border p-8 shadow-sm">
      <h1 className="text-heading-sm text-foreground text-center">
        Verification failed
      </h1>
      <p className="text-destructive text-body-md text-center">{error}</p>
      <Button variant="outline-secondary" asChild className="w-full">
        <Link href="/register">Back to register</Link>
      </Button>
    </div>
  )
}

const VerifyEmailPage = () => {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  )
}

export default VerifyEmailPage
