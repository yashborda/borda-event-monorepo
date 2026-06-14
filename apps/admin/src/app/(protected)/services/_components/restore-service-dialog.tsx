'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface RestoreServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceId: string
  serviceName: string
  onSuccess: () => void
}

export function RestoreServiceDialog({
  open,
  onOpenChange,
  serviceId,
  serviceName,
  onSuccess,
}: RestoreServiceDialogProps) {
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    setRestoring(true)
    try {
      await apiFetch(`/api/admin/services/${serviceId}/restore`, {
        method: 'POST',
      })
      toast.success('Service has been restored')
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
      title="Restore Service"
      description={`Restore "${serviceName}"? It will become active again.`}
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
