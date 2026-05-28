'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, Textarea, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useEffect } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface DeleteBlogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blogId: string
  blogTitle: string
  onSuccess: () => void
}

const schema = z.object({
  reason: z.string().min(1, 'Reason is required'),
})

type IFormData = { reason: string }

export function DeleteBlogDialog({
  open,
  onOpenChange,
  blogId,
  blogTitle,
  onSuccess,
}: DeleteBlogDialogProps) {
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
      await apiFetch(`/api/admin/blogs/${blogId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason: data.reason }),
      })
      toast.success('Blog post has been deleted')
      onSuccess()
    } catch (e) {
      handleException(e as Parameters<typeof handleException>[0])
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Blog Post"
      description={`Soft delete "${blogTitle}". The blog post will be hidden from the table by default. You can restore it using the "Show Deleted" toggle.`}
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
          form: 'delete-blog-form',
          disabled: isSubmitting,
        },
      ]}
    >
      <form id="delete-blog-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="pb-2">
          <Textarea
            id="reason"
            label="Reason for Deletion"
            placeholder="Enter a reason for deleting this blog post…"
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
