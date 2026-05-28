'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError } from '@pkg/types'
import { Button, Input, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Link from 'next/link'

import { useState } from 'react'

import { handleException } from '@/lib/api-helper'

import { useAuth } from '@/context/auth-context'

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters')
    .pipe(z.email('Email is invalid')),
})
type IFormData = z.infer<typeof schema>

const MagicLinkPage = () => {
  const { requestMagicLink } = useAuth()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: IFormData) => {
    try {
      await requestMagicLink(data.email)
      setSubmitted(true)
      toast.success('Magic link sent!')
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  return (
    <div className="border-border bg-background shadow-shadow flex flex-col gap-6 rounded-xl border p-8 shadow-sm">
      <h1 className="text-heading-sm text-foreground text-center">
        Sign in with magic link
      </h1>

      {submitted ? (
        <div className="flex flex-col gap-4">
          <div className="border-success/30 bg-success-muted flex flex-col gap-1 rounded-lg border p-4">
            <p className="text-success-muted-foreground font-medium">
              Check your inbox
            </p>
            <p className="text-body-sm text-success-muted-foreground">
              If that email exists, we sent a magic sign-in link.
            </p>
          </div>
          <Button variant="outline-secondary" asChild className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <p className="text-muted-foreground text-body-md">
            Enter your email and we&apos;ll send you a one-time sign-in link.
          </p>
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="admin@example.com"
            required
            errorMessage={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send magic link'}
          </Button>
          <Button variant="ghost-secondary" asChild className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </form>
      )}
    </div>
  )
}

export default MagicLinkPage
