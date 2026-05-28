'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError } from '@pkg/types'
import { Button, Heading, Input } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useState } from 'react'

import { env } from '@/env'

import { handleException } from '@/lib/api-helper'

import { useAuth } from '@/context/auth-context'

const schema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .max(255, 'Full name must be at most 255 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .max(255, 'Email must be at most 255 characters')
      .pipe(z.email('Email is invalid')),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })
type IFormData = z.infer<typeof schema>

const RegisterPage = () => {
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: IFormData) => {
    setError('')
    try {
      await registerUser(data.email, data.password, data.fullName)
      router.push('/dashboard')
    } catch (e) {
      setError(handleException(e as IApiError))
    }
  }

  return (
    <div className="border-border bg-background shadow-shadow flex flex-col gap-6 rounded-xl border p-8 shadow-sm">
      <Heading as="h1" size="sm" className="text-center">
        Create your account
      </Heading>

      <Button variant="outline-secondary" className="w-full gap-2" asChild>
        <a href={env.NEXT_PUBLIC_GOOGLE_AUTH_URL}>
          <Image
            src="/images/google-icon-logo.svg"
            alt="Google"
            width={16}
            height={16}
          />
          Sign up with Google
        </a>
      </Button>

      <div className="relative flex items-center">
        <div className="border-border flex-1 border-t" />
        <span className="text-muted-foreground bg-background px-3 text-xs tracking-wider uppercase">
          or
        </span>
        <div className="border-border flex-1 border-t" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          id="fullName"
          label="Full name"
          placeholder="Alex Johnson"
          required
          errorMessage={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
          errorMessage={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          required
          errorMessage={errors.password?.message}
          {...register('password')}
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
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-muted-foreground text-body-sm text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-foreground font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
