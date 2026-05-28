'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Input, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useImperativeHandle } from 'react'

import { useAuth } from '@/context/auth-context'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type IFormData = z.infer<typeof schema>

export type IChangePasswordFormRef = {
  submit: () => void
}

type IChangePasswordFormProps = {
  onSaveSuccess?: () => void
  footer?: React.ReactNode
}

export const ChangePasswordForm = forwardRef<
  IChangePasswordFormRef,
  IChangePasswordFormProps
>(({ onSaveSuccess, footer }, ref) => {
  const { changePassword } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({ resolver: zodResolver(schema) })

  useImperativeHandle(ref, () => ({ submit: handleSubmit(onSubmit) }))

  const onSubmit = async (data: IFormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword)
      toast.success('Password changed successfully.')
      reset()
      onSaveSuccess?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Change failed')
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
          id="currentPassword"
          type="password"
          label="Current Password"
          required
          disabled={isSubmitting}
          errorMessage={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="newPassword"
          type="password"
          label="New Password"
          required
          disabled={isSubmitting}
          errorMessage={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          id="confirm"
          type="password"
          label="Confirm New Password"
          required
          disabled={isSubmitting}
          errorMessage={errors.confirm?.message}
          {...register('confirm')}
        />
      </div>

      {footer}
    </form>
  )
})

ChangePasswordForm.displayName = 'ChangePasswordForm'
