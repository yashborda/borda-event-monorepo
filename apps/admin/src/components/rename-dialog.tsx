'use client'

import type { IApiError } from '@pkg/types'
import { Dialog, Input } from '@pkg/ui'

import { useEffect, useState } from 'react'

import { handleException } from '@/lib/api-helper'

/**
 * Generic rename dialog for a single name field. `onSave` should throw to keep
 * the dialog open on failure (the error is surfaced via handleException).
 * Used by the theme photo/video sections and the cover/banner image picker.
 */
export function RenameDialog({
  open,
  title,
  description,
  initialValue,
  onClose,
  onSave,
}: {
  open: boolean
  title: string
  description: string
  initialValue: string
  onClose: () => void
  onSave: (value: string) => Promise<void>
}) {
  const [value, setValue] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (open) setValue(initialValue)
  }, [open, initialValue])
  const trimmed = value.trim()
  const submit = async () => {
    if (!trimmed) return
    setSaving(true)
    try {
      await onSave(trimmed)
      onClose()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && !saving && onClose()}
      title={title}
      description={description}
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: onClose,
          disabled: saving,
          className: 'ml-auto',
        },
        {
          label: saving ? 'Saving…' : 'Save',
          onClick: submit,
          disabled: saving || !trimmed,
        },
      ]}
    >
      <div className="pb-2">
        <Input
          id="rename-value"
          label="New name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && trimmed && !saving) {
              e.preventDefault()
              void submit()
            }
          }}
          autoFocus
        />
      </div>
    </Dialog>
  )
}
