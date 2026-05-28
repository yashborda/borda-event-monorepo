'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError } from '@pkg/types'
import { Input, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useImperativeHandle } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

const schema = z
  .object({
    fullName: z.string().min(1, 'Full name is required').max(255),
    email: z
      .string()
      .min(1, 'Email is required')
      .max(255, 'Email must be at most 255 characters')
      .pipe(z.email('Email is invalid')),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .max(128, 'Max 128 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type IFormData = z.infer<typeof schema>

export type IWebsiteUserCreateFormRef = {
  submit: () => void
}

type IWebsiteUserCreateFormProps = {
  onSaveSuccess?: () => void
  footer?: React.ReactNode
}

export const WebsiteUserCreateForm = forwardRef<
  IWebsiteUserCreateFormRef,
  IWebsiteUserCreateFormProps
>(({ onSaveSuccess, footer }, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({ resolver: zodResolver(schema) })

  useImperativeHandle(ref, () => ({
    submit: handleSubmit(onSubmit),
  }))

  const onSubmit = async (data: IFormData) => {
    try {
      await apiFetch('/api/admin/website-users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        }),
      })
      toast.success('User created successfully')
      onSaveSuccess?.()
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="fullName"
          label="Full Name"
          required
          placeholder="Jane Smith"
          disabled={isSubmitting}
          errorMessage={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          required
          placeholder="jane@example.com"
          disabled={isSubmitting}
          errorMessage={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="password"
          type="password"
          label="Password"
          required
          placeholder="Min. 8 characters"
          disabled={isSubmitting}
          errorMessage={errors.password?.message}
          {...register('password')}
        />
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          required
          placeholder="Re-enter password"
          disabled={isSubmitting}
          errorMessage={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      {footer}
    </form>
  )
})

WebsiteUserCreateForm.displayName = 'WebsiteUserCreateForm'
