'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError } from '@pkg/types'
import { Input, Textarea, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useImperativeHandle } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  phone: z.string().min(1, 'Phone is required').max(20),
  email: z
    .string()
    .max(255)
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, {
      message: 'Email is invalid',
    }),
  address: z.string().optional(),
})

type IFormData = z.infer<typeof schema>

export type ICustomerCreateFormRef = { submit: () => void }

type ICustomerCreateFormProps = {
  onSaveSuccess?: () => void
  footer?: React.ReactNode
}

export const CustomerCreateForm = forwardRef<
  ICustomerCreateFormRef,
  ICustomerCreateFormProps
>(({ onSaveSuccess, footer }, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: IFormData) => {
    try {
      await apiFetch('/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email || undefined,
          address: data.address || undefined,
        }),
      })
      toast.success('Customer created successfully')
      onSaveSuccess?.()
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  useImperativeHandle(ref, () => ({ submit: handleSubmit(onSubmit) }))

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
          id="phone"
          label="Phone"
          required
          placeholder="9876543210"
          disabled={isSubmitting}
          errorMessage={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="jane@example.com"
          disabled={isSubmitting}
          errorMessage={errors.email?.message}
          {...register('email')}
        />
      </div>

      <Textarea
        id="address"
        label="Address"
        placeholder="Customer address…"
        disabled={isSubmitting}
        errorMessage={errors.address?.message}
        {...register('address')}
      />

      {footer}
    </form>
  )
})

CustomerCreateForm.displayName = 'CustomerCreateForm'
