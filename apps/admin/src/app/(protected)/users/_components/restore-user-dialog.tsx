'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface RestoreUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess: () => void
}

export function RestoreUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: RestoreUserDialogProps) {
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    setRestoring(true)
    try {
      await apiFetch(`/api/admin/users/${userId}/restore`, {
        method: 'POST',
      })
      toast.success('User has been restored')
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
      title="Restore User"
      description={`Restore "${userName}"? The user will become active again and visible in the main users list.`}
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
