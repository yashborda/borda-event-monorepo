'use client'

import type { IApiError } from '@pkg/types'
import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface SyncBlogTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'single' | 'all'
  tagId?: string
  tagName?: string
  onSuccess: () => void
}

export const SyncBlogTagDialog = ({
  open,
  onOpenChange,
  mode,
  tagId,
  tagName,
  onSuccess,
}: SyncBlogTagDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onConfirm = async () => {
    setIsSubmitting(true)
    try {
      const url =
        mode === 'single'
          ? `/api/admin/blog-tags/${tagId}/revalidate`
          : '/api/admin/blog-tags/revalidate-all'
      await apiFetch(url, { method: 'POST', body: JSON.stringify({}) })
      toast.success(
        mode === 'single'
          ? 'Tag synced successfully'
          : 'All tags synced successfully'
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
      title={mode === 'single' ? 'Sync Tag' : 'Sync All Tags'}
      description={
        mode === 'single'
          ? `Sync "${tagName}" to the website? This will clear and regenerate the cached page.`
          : 'Sync all tags to the website? This will clear and regenerate all cached tag pages.'
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
