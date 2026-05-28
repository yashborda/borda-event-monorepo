'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, Textarea, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useEffect } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface DeleteBlogAuthorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  authorId: string
  authorName: string
  onSuccess: () => void
}

const schema = z.object({
  reason: z.string().min(1, 'Reason is required'),
})

type IFormData = { reason: string }

export function DeleteBlogAuthorDialog({
  open,
  onOpenChange,
  authorId,
  authorName,
  onSuccess,
}: DeleteBlogAuthorDialogProps) {
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
      await apiFetch(`/api/admin/blog-authors/${authorId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason: data.reason }),
      })
      toast.success('Blog author has been deleted')
      onSuccess()
    } catch (e) {
      handleException(e as Parameters<typeof handleException>[0])
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Blog Author"
      description={`Soft delete "${authorName}". The author will be hidden from the table by default. You can restore visibility using the "Show Deleted" toggle.`}
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
          form: 'delete-blog-author-form',
          disabled: isSubmitting,
        },
      ]}
    >
      <form
        id="delete-blog-author-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="pb-2">
          <Textarea
            id="reason"
            label="Reason for Deletion"
            placeholder="Enter a reason for deleting this author…"
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
