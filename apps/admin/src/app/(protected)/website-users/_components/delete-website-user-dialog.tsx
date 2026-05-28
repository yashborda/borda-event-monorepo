'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, Textarea, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useEffect } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface DeleteWebsiteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess: () => void
}

const schema = z.object({
  reason: z.string().min(1, 'Reason is required'),
})

type IFormData = { reason: string }

export function DeleteWebsiteUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: DeleteWebsiteUserDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = async (data: IFormData) => {
    try {
      await apiFetch(`/api/admin/website-users/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason: data.reason }),
      })
      toast.success('User has been deleted')
      onSuccess()
    } catch (e) {
      handleException(e as Parameters<typeof handleException>[0])
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete User"
      description={`Soft delete "${userName}". The user will be hidden from the table by default. You can restore visibility using the "Show Deleted" toggle.`}
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => onOpenChange(false),
          disabled: isSubmitting,
          className: 'ml-auto',
        },
        {
          label: isSubmitting ? 'Deleting…' : 'Delete',
          variant: 'destructive',
          type: 'submit',
          form: 'delete-website-user-form',
          disabled: isSubmitting,
        },
      ]}
    >
      <form
        id="delete-website-user-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="pb-2">
          <Textarea
            id="reason"
            label="Reason for Deletion"
            placeholder="Enter a reason for deleting this user…"
            required
            disabled={isSubmitting}
            errorMessage={errors.reason?.message}
            {...register('reason')}
          />
        </div>
      </form>
    </Dialog>
  )
}
