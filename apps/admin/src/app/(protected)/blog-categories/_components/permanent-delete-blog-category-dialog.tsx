'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface PermanentDeleteBlogCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: string
  categoryName: string
  onSuccess: () => void
}

export function PermanentDeleteBlogCategoryDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  onSuccess,
}: PermanentDeleteBlogCategoryDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiFetch(`/api/admin/blog-categories/${categoryId}/permanent`, {
        method: 'DELETE',
      })
      toast.success('Blog category has been permanently deleted')
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
      title="Permanently Delete Blog Category"
      description={`This cannot be undone. "${categoryName}" will be removed forever. All blog associations with this category will also be removed.`}
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
