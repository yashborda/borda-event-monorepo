'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface DeleteSocialPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  postLabel: string
  onSuccess: () => void
}

export function DeleteSocialPostDialog({
  open,
  onOpenChange,
  postId,
  postLabel,
  onSuccess,
}: DeleteSocialPostDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiFetch(`/api/admin/social-posts/${postId}`, { method: 'DELETE' })
      toast.success('Social post has been deleted')
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
      onOpenChange={(o) => {
        if (!deleting) onOpenChange(o)
      }}
      title="Delete Social Post"
      description={`Permanently delete "${postLabel}"? This cannot be undone.`}
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => onOpenChange(false),
          disabled: deleting,
          className: 'ml-auto',
        },
        {
          label: deleting ? 'Deleting…' : 'Delete',
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
