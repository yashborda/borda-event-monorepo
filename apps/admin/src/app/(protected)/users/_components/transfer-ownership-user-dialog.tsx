'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, Input, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useEffect } from 'react'

import { ApiError, apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface TransferOwnershipUserDialogProps {
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
        'Transfer target cannot be the user being transferred'
      ),
  })

type IFormData = { transferToEmail: string }

export function TransferOwnershipUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
  onSuccess,
}: TransferOwnershipUserDialogProps) {
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
      await apiFetch(`/api/admin/users/${userId}/transfer-ownership`, {
        method: 'POST',
        body: JSON.stringify({ transferToEmail: data.transferToEmail }),
      })
      toast.success('Ownership has been transferred')
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
      title="Transfer Ownership"
      description={`Transfer audit records for "${userName}" to another user. This does not delete the account.`}
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => onOpenChange(false),
          disabled: isSubmitting,
          className: 'ml-auto',
        },
        {
          label: isSubmitting ? 'Transferring…' : 'Transfer',
          type: 'submit',
          form: 'transfer-ownership-user-form',
          disabled: isSubmitting,
        },
      ]}
    >
      <form
        id="transfer-ownership-user-form"
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
