'use client'

import type { IApiError } from '@pkg/types'
import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface SyncBlogCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'single' | 'all'
  categoryId?: string
  categoryName?: string
  onSuccess: () => void
}

export const SyncBlogCategoryDialog = ({
  open,
  onOpenChange,
  mode,
  categoryId,
  categoryName,
  onSuccess,
}: SyncBlogCategoryDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onConfirm = async () => {
    setIsSubmitting(true)
    try {
      const url =
        mode === 'single'
          ? `/api/admin/blog-categories/${categoryId}/revalidate`
          : '/api/admin/blog-categories/revalidate-all'
      await apiFetch(url, { method: 'POST', body: JSON.stringify({}) })
      toast.success(
        mode === 'single'
          ? 'Category synced successfully'
          : 'All categories synced successfully'
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
      title={mode === 'single' ? 'Sync Category' : 'Sync All Categories'}
      description={
        mode === 'single'
          ? `Sync "${categoryName}" to the website? This will clear and regenerate the cached page.`
          : 'Sync all categories to the website? This will clear and regenerate all cached category pages.'
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
