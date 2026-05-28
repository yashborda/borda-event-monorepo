'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface PermanentDeleteBlogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blogId: string
  blogTitle: string
  onSuccess: () => void
}

export function PermanentDeleteBlogDialog({
  open,
  onOpenChange,
  blogId,
  blogTitle,
  onSuccess,
}: PermanentDeleteBlogDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiFetch(`/api/admin/blogs/${blogId}/permanent`, {
        method: 'DELETE',
      })
      toast.success('Blog post has been permanently deleted')
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
      title="Permanently Delete Blog Post"
      description={`Permanently delete "${blogTitle}"? This cannot be undone — the blog post record will be removed entirely.`}
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
