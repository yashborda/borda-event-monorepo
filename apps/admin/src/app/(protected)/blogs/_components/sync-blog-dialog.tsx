'use client'

import type { IApiError } from '@pkg/types'
import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface SyncBlogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'single' | 'all'
  blogId?: string
  blogTitle?: string
  onSuccess: () => void
}

export const SyncBlogDialog = ({
  open,
  onOpenChange,
  mode,
  blogId,
  blogTitle,
  onSuccess,
}: SyncBlogDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onConfirm = async () => {
    setIsSubmitting(true)
    try {
      const url =
        mode === 'single'
          ? `/api/admin/blogs/${blogId}/revalidate`
          : '/api/admin/blogs/revalidate-all'
      await apiFetch(url, { method: 'POST', body: JSON.stringify({}) })
      toast.success(
        mode === 'single'
          ? 'Blog post synced successfully'
          : 'All blog posts synced successfully'
      )
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
      onOpenChange={(v) => {
        if (!isSubmitting) onOpenChange(v)
      }}
      title={mode === 'single' ? 'Sync Blog Post' : 'Sync All Blog Posts'}
      description={
        mode === 'single'
          ? `Sync "${blogTitle}" to the website? This will clear and regenerate the cached page.`
          : 'Sync all blog posts to the website? This will clear and regenerate all cached blog pages.'
      }
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => onOpenChange(false),
          disabled: isSubmitting,
          className: 'ml-auto',
        },
        {
          label: isSubmitting
            ? 'Syncing…'
            : mode === 'single'
              ? 'Sync Now'
              : 'Sync All Now',
          onClick: onConfirm,
          disabled: isSubmitting,
        },
      ]}
    />
  )
}
