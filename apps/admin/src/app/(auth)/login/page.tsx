'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError } from '@pkg/types'
import { Button, Input, Label } from '@pkg/ui'
import { IconWand } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useState } from 'react'

import { env } from '@/env'

import { handleException } from '@/lib/api-helper'

import { useAuth } from '@/context/auth-context'

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters')
    .pipe(z.email('Email is invalid')),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be at most 128 characters'),
})
type IFormData = z.infer<typeof schema>

const LoginPage = () => {
  const { login } = useAuth()
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
      await login(data.email, data.password)
      router.push('/dashboard')
    } catch (e) {
      setError(handleException(e as IApiError))
    }
  }

  return (
    <div className="border-border bg-background shadow-shadow flex flex-col gap-6 rounded-xl border p-8 shadow-sm">
      <h1 className="text-heading-sm text-foreground text-center">
        Sign in (Admin panel)
      </h1>

      <Button variant="outline-secondary" className="w-full gap-2" asChild>
        <a href={env.NEXT_PUBLIC_GOOGLE_AUTH_URL}>
          <Image
            src="/images/google-icon-logo.svg"
            alt="Google"
            width={16}
            height={16}
          />
          Sign in with Google
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
          id="email"
          type="email"
          label="Email"
          placeholder="admin@example.com"
          required
          errorMessage={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-body-sm"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            errorMessage={errors.password?.message}
            {...register('password')}
          />
        </div>

        {error && <p className="text-destructive text-body-sm">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <Button variant="ghost" className="w-full gap-2" asChild>
        <Link href="/magic-link">
          <IconWand className="size-4" />
          Sign in with magic link
        </Link>
      </Button>
    </div>
  )
}

export default LoginPage
