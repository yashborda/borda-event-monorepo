'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface PermanentDeleteWebsiteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess: () => void
}

export function PermanentDeleteWebsiteUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: PermanentDeleteWebsiteUserDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiFetch(`/api/admin/website-users/${userId}/permanent`, {
        method: 'DELETE',
      })
      toast.success('User has been permanently deleted')
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
      title="Permanently Delete User"
      description={`Permanently delete "${userName}"? This cannot be undone — the user record will be removed entirely.`}
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
