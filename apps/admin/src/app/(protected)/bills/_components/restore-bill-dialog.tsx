'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface RestoreBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  billId: string
  billNo: string
  onSuccess: () => void
}

export function RestoreBillDialog({
  open,
  onOpenChange,
  billId,
  billNo,
  onSuccess,
}: RestoreBillDialogProps) {
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    setRestoring(true)
    try {
      await apiFetch(`/api/admin/bills/${billId}/restore`, { method: 'POST' })
      toast.success('Bill has been restored')
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
      onOpenChange={(o) => {
        if (!restoring) onOpenChange(o)
      }}
      title="Restore Bill"
      description={`Restore bill "${billNo}"? It will become active again.`}
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
