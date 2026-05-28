'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { IApiError } from '@pkg/types'
import { Button, Heading, Input, toast } from '@pkg/ui'
import { parseAsString, useQueryState } from 'nuqs'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Link from 'next/link'

import { Suspense, useState } from 'react'

import { handleException } from '@/lib/api-helper'

import { useAuth } from '@/context/auth-context'

const schema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })
type IFormData = z.infer<typeof schema>

const ResetPasswordForm = () => {
  const { resetPassword } = useAuth()
  const [token] = useQueryState('token', parseAsString.withDefault(''))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: IFormData) => {
    setError('')
    if (!token) {
      setError('Reset token is missing.')
      return
    }
    try {
      await resetPassword(token, data.newPassword)
      setSuccess(true)
      toast.success('Password updated successfully!')
    } catch (e) {
      setError(handleException(e as IApiError))
    }
  }

  if (!token) {
    return (
      <div className="border-border bg-background shadow-shadow flex flex-col gap-6 rounded-xl border p-8 text-center shadow-sm">
        <p className="text-destructive font-medium">Invalid reset link</p>
        <Button variant="outline-secondary" asChild>
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="border-border bg-background shadow-shadow flex flex-col gap-6 rounded-xl border p-8 shadow-sm">
      <Heading as="h1" size="sm" className="text-center">
        Set new password
      </Heading>

      {success ? (
        <div className="flex flex-col gap-4">
          <div className="border-success/30 bg-success-muted flex flex-col gap-1 rounded-lg border p-4">
            <p className="text-success-muted-foreground font-medium">
              Password updated!
            </p>
            <p className="text-body-sm text-success-muted-foreground">
              Your password has been reset successfully.
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
          <Input
            id="newPassword"
            type="password"
            label="New password"
            placeholder="At least 8 characters"
            required
            errorMessage={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            id="confirm"
            type="password"
            label="Confirm password"
            placeholder="Repeat password"
            required
            errorMessage={errors.confirm?.message}
            {...register('confirm')}
          />
          {error && <p className="text-destructive text-body-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>
      )}
    </div>
  )
}

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-body-sm text-center">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

export default ResetPasswordPage
