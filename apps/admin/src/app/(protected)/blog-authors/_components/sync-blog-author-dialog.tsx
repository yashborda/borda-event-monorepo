'use client'

import type { IApiError } from '@pkg/types'
import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface SyncBlogAuthorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'single' | 'all'
  authorId?: string
  authorName?: string
  onSuccess: () => void
}

export const SyncBlogAuthorDialog = ({
  open,
  onOpenChange,
  mode,
  authorId,
  authorName,
  onSuccess,
}: SyncBlogAuthorDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onConfirm = async () => {
    setIsSubmitting(true)
    try {
      const url =
        mode === 'single'
          ? `/api/admin/blog-authors/${authorId}/revalidate`
          : '/api/admin/blog-authors/revalidate-all'
      await apiFetch(url, { method: 'POST', body: JSON.stringify({}) })
      toast.success(
        mode === 'single'
          ? 'Author synced successfully'
          : 'All authors synced successfully'
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
      title={mode === 'single' ? 'Sync Author' : 'Sync All Authors'}
      description={
        mode === 'single'
          ? `Sync "${authorName}" to the website? This will clear and regenerate the cached page.`
          : 'Sync all authors to the website? This will clear and regenerate all cached author pages.'
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
