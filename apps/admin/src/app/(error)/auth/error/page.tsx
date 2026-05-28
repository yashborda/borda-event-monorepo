'use client'

import { Button } from '@pkg/ui'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Suspense } from 'react'

const messages: Record<string, string> = {
  oauth_failed: 'Google sign-in failed. Please try again.',
  account_exists: 'No admin account found for this Google account.',
  inactive_account:
    'Your account has been deactivated. Contact your administrator.',
}

const AuthErrorContent = () => {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') ?? 'oauth_failed'
  const message = messages[reason] ?? messages.oauth_failed

  return (
    <div className="flex max-w-sm flex-col items-center gap-6 text-center">
      <p className="text-destructive text-5xl font-bold">!</p>
      <h1 className="text-heading-xl text-foreground">Sign-in failed</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button asChild>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  )
}

const AuthErrorPage = () => {
  return (
    <Suspense fallback={null}>
      <AuthErrorContent />
    </Suspense>
  )
}

export default AuthErrorPage
