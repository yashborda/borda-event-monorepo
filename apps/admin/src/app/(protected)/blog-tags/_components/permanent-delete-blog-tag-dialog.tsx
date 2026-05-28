'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface PermanentDeleteBlogTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tagId: string
  tagName: string
  onSuccess: () => void
}

export function PermanentDeleteBlogTagDialog({
  open,
  onOpenChange,
  tagId,
  tagName,
  onSuccess,
}: PermanentDeleteBlogTagDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiFetch(`/api/admin/blog-tags/${tagId}/permanent`, {
        method: 'DELETE',
      })
      toast.success('Blog tag has been permanently deleted')
      onSuccess()
    } catch (e) {
      handleException(e as Parameters<typeof handleException>[0])
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!deleting) onOpenChange(open)
      }}
      title="Permanently Delete Blog Tag"
      description={`Permanently delete "${tagName}"? This cannot be undone — the tag record will be removed entirely.`}
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => onOpenChange(false),
          disabled: deleting,
          className: 'ml-auto',
        },
        {
          label: deleting ? 'Deleting…' : 'Delete Permanently',
          variant: 'destructive',
          onClick: handleDelete,
          disabled: deleting,
        },
      ]}
    >
      <div />
    </Dialog>
  )
}
