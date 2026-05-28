'use client'

import type { IApiError } from '@pkg/types'
import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface PublishBlogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blogId: string
  blogTitle: string
  currentStatus: string
  onSuccess: () => void
}

export function PublishBlogDialog({
  open,
  onOpenChange,
  blogId,
  blogTitle,
  onSuccess,
}: PublishBlogDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onConfirm = async () => {
    setIsSubmitting(true)
    try {
      await apiFetch(`/api/admin/blogs/${blogId}/publish`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
      toast.success('Blog post has been published')
      onSuccess()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Publish Blog Post"
      description={`Publish "${blogTitle}" immediately?`}
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => onOpenChange(false),
          disabled: isSubmitting,
          className: 'ml-auto',
        },
        {
          label: isSubmitting ? 'Publishing…' : 'Publish Now',
          onClick: onConfirm,
          disabled: isSubmitting,
        },
      ]}
    />
  )
}
