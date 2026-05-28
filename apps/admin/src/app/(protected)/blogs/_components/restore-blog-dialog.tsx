'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface RestoreBlogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blogId: string
  blogTitle: string
  onSuccess: () => void
}

export function RestoreBlogDialog({
  open,
  onOpenChange,
  blogId,
  blogTitle,
  onSuccess,
}: RestoreBlogDialogProps) {
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    setRestoring(true)
    try {
      await apiFetch(`/api/admin/blogs/${blogId}/restore`, {
        method: 'POST',
      })
      toast.success('Blog post has been restored')
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
      title="Restore Blog Post"
      description={`Restore "${blogTitle}"? The blog post will become visible again in the main blogs list.`}
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
