'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface RestoreBlogAuthorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  authorId: string
  authorName: string
  onSuccess: () => void
}

export function RestoreBlogAuthorDialog({
  open,
  onOpenChange,
  authorId,
  authorName,
  onSuccess,
}: RestoreBlogAuthorDialogProps) {
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    setRestoring(true)
    try {
      await apiFetch(`/api/admin/blog-authors/${authorId}/restore`, {
        method: 'POST',
      })
      toast.success('Blog author has been restored')
      onSuccess()
    } catch (e) {
      handleException(e as Parameters<typeof handleException>[0])
    } finally {
      setRestoring(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!restoring) onOpenChange(open)
      }}
      title="Restore Blog Author"
      description={`Restore "${authorName}"? The author will become active again and visible in the main authors list.`}
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => onOpenChange(false),
          disabled: restoring,
          className: 'ml-auto',
        },
        {
          label: restoring ? 'Restoring…' : 'Restore',
          onClick: handleRestore,
          disabled: restoring,
        },
      ]}
    >
      <div />
    </Dialog>
  )
}
