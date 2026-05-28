'use client'

import type { IApiError } from '@pkg/types'
import { Dialog, toast } from '@pkg/ui'

import { useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface DeleteRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleId: string
  roleName: string
  onSuccess: () => void
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  roleId,
  roleName,
  onSuccess,
}: DeleteRoleDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiFetch(`/api/admin/roles/${roleId}`, { method: 'DELETE' })
      toast.success(`Role has been deleted`)
      onSuccess()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Role"
      description={`Are you sure you want to delete "${roleName}"? This action cannot be undone.`}
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => onOpenChange(false),
          disabled: deleting,
          className: 'ml-auto',
        },
        {
          label: deleting ? 'Deleting…' : 'Delete',
          variant: 'destructive',
          onClick: handleDelete,
          disabled: deleting,
        },
      ]}
    />
  )
}
