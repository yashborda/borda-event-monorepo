'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError, ICustomer } from '@pkg/types'
import { Input, Skeleton, Textarea, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { usePermissions } from '@/hooks/use-permissions'

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

export type ICustomerEditFormRef = { submit: () => void }

type ICustomerEditFormProps = {
  customerId: string
  onLoad?: (data: ICustomer) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

export const CustomerEditForm = forwardRef<
  ICustomerEditFormRef,
  ICustomerEditFormProps
>(
  (
    {
      customerId,
      onLoad,
      onLoadingChange,
      onSaveSuccess,
      onSubmittingChange,
      footer,
    },
    ref
  ) => {
    const { can } = usePermissions()
    const canUpdate = can('customers:update')

    const [isLoading, setIsLoading] = useState(true)
    const [isDeleted, setIsDeleted] = useState(false)

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<IFormData>({ resolver: zodResolver(schema) })

    useEffect(() => {
      onSubmittingChange?.(isSubmitting)
    }, [isSubmitting, onSubmittingChange])

    useEffect(() => {
      setIsLoading(true)
      onLoadingChange?.(true)
      apiFetch<ICustomer>(`/api/admin/customers/${customerId}`)
        .then((data) => {
          reset({
            fullName: data.fullName,
            phone: data.phone,
            email: data.email ?? '',
            address: data.address ?? '',
          })
          setIsDeleted(!!data.deletedAt)
          onLoad?.(data)
        })
        .catch((e: IApiError) => handleException(e))
        .finally(() => {
          setIsLoading(false)
          onLoadingChange?.(false)
        })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId])

    const onSubmit = async (data: IFormData) => {
      try {
        await apiFetch(`/api/admin/customers/${customerId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            fullName: data.fullName,
            phone: data.phone,
            email: data.email || null,
            address: data.address || null,
          }),
        })
        toast.success('Customer updated successfully')
        onSaveSuccess?.()
      } catch (e) {
        handleException(e as IApiError)
      }
    }

    useImperativeHandle(ref, () => ({ submit: handleSubmit(onSubmit) }))

    if (isLoading) {
      return (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      )
    }

    const disabled = !canUpdate || isSubmitting || isDeleted

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
            disabled={disabled}
            errorMessage={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            id="phone"
            label="Phone"
            required
            disabled={disabled}
            errorMessage={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            disabled={disabled}
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>

        <Textarea
          id="address"
          label="Address"
          disabled={disabled}
          errorMessage={errors.address?.message}
          {...register('address')}
        />

        {footer}
      </form>
    )
  }
)

CustomerEditForm.displayName = 'CustomerEditForm'
