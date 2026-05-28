'use client'

import { Button, Heading } from '@pkg/ui'
import { parseAsStringLiteral, useQueryState } from 'nuqs'

import Link from 'next/link'

import { Suspense } from 'react'

const reasons = ['oauth_failed', 'account_exists', 'inactive_account'] as const

const messages: Record<(typeof reasons)[number], string> = {
  oauth_failed: 'Google sign-in failed. Please try again.',
  account_exists:
    'An account with this email already exists. Sign in with email and password instead.',
  inactive_account: 'Your account has been deactivated. Contact support.',
}

const AuthErrorContent = () => {
  const [reason] = useQueryState(
    'reason',
    parseAsStringLiteral(reasons).withDefault('oauth_failed')
  )

  return (
    <div className="flex max-w-sm flex-col items-center gap-6 text-center">
      <p className="text-destructive text-5xl font-bold">!</p>
      <Heading as="h1">Sign-in failed</Heading>
      <p className="text-muted-foreground">{messages[reason]}</p>
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
