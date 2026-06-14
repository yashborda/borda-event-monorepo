'use client'

import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface RestoreCatalogueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogueId: string
  catalogueName: string
  onSuccess: () => void
}

export function RestoreCatalogueDialog({
  open,
  onOpenChange,
  catalogueId,
  catalogueName,
  onSuccess,
}: RestoreCatalogueDialogProps) {
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    setRestoring(true)
    try {
      await apiFetch(`/api/admin/catalogues/${catalogueId}/restore`, {
        method: 'POST',
      })
      toast.success('Catalogue has been restored')
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
      title="Restore Catalogue"
      description={`Restore "${catalogueName}"? It will become active again.`}
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
