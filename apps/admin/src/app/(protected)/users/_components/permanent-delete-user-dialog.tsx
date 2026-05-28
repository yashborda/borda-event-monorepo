'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, Input, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useEffect } from 'react'

import { ApiError, apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface PermanentDeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  userEmail: string
  onSuccess: () => void
}

const makeSchema = (userEmail: string) =>
  z.object({
    transferToEmail: z
      .string()
      .min(1, 'Transfer email is required')
      .pipe(z.email('Enter a valid email address'))
      .refine(
        (v) => v.toLowerCase() !== userEmail.toLowerCase(),
        'Transfer target cannot be the user being deleted'
      ),
  })

type IFormData = { transferToEmail: string }

export function PermanentDeleteUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
  onSuccess,
}: PermanentDeleteUserDialogProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({
    resolver: zodResolver(makeSchema(userEmail)),
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = async (data: IFormData) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/permanent`, {
        method: 'DELETE',
        body: JSON.stringify({ transferToEmail: data.transferToEmail }),
      })
      toast.success('User has been permanently deleted')
      onSuccess()
    } catch (e) {
      if (e instanceof ApiError && e.data.statusCode === 404) {
        setError('transferToEmail', { message: e.message })
      } else {
        handleException(e as Parameters<typeof handleException>[0])
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Permanently Delete User"
      description={`Permanently delete "${userName}". Their remaining audit records will be transferred to the user below. This cannot be undone.`}
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => onOpenChange(false),
          disabled: isSubmitting,
          className: 'ml-auto',
        },
        {
          label: isSubmitting ? 'Deleting…' : 'Delete Permanently',
          variant: 'destructive',
          type: 'submit',
          form: 'permanent-delete-user-form',
          disabled: isSubmitting,
        },
      ]}
    >
      <form
        id="permanent-delete-user-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="pb-2">
          <Input
            id="transferToEmail"
            type="email"
            label="Transfer Ownership To"
            placeholder="user@example.com"
            required
            autoComplete="off"
            disabled={isSubmitting}
            errorMessage={errors.transferToEmail?.message}
            {...register('transferToEmail')}
          />
        </div>
      </form>
    </Dialog>
  )
}
