'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface RestoreBlogTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tagId: string
  tagName: string
  onSuccess: () => void
}

export function RestoreBlogTagDialog({
  open,
  onOpenChange,
  tagId,
  tagName,
  onSuccess,
}: RestoreBlogTagDialogProps) {
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    setRestoring(true)
    try {
      await apiFetch(`/api/admin/blog-tags/${tagId}/restore`, {
        method: 'POST',
      })
      toast.success('Blog tag has been restored')
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
      title="Restore Blog Tag"
      description={`Restore "${tagName}"? The tag will become active again and visible in the main tags list.`}
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
