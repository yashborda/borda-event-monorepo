'use client'

import type { IBlogAuthor } from '@pkg/types'
import { Dialog, Select, toast } from '@pkg/ui'

import { useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

interface PermanentDeleteBlogAuthorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  authorId: string
  authorName: string
  onSuccess: () => void
}

export function PermanentDeleteBlogAuthorDialog({
  open,
  onOpenChange,
  authorId,
  authorName,
  onSuccess,
}: PermanentDeleteBlogAuthorDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [authors, setAuthors] = useState<IBlogAuthor[]>([])
  const [loadingAuthors, setLoadingAuthors] = useState(false)
  const [transferToAuthorId, setTransferToAuthorId] = useState<
    string | undefined
  >(undefined)

  useEffect(() => {
    if (!open) {
      setTransferToAuthorId(undefined)
      return
    }
    setLoadingAuthors(true)
    apiFetch<{ data: IBlogAuthor[] }>(
      `/api/admin/blog-authors?includeDeleted=false&statusFilter=active&limit=100`
    )
      .then((res) => {
        setAuthors(res.data.filter((a) => a.id !== authorId))
      })
      .catch((e) => handleException(e as Parameters<typeof handleException>[0]))
      .finally(() => setLoadingAuthors(false))
  }, [open, authorId])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiFetch(`/api/admin/blog-authors/${authorId}/permanent`, {
        method: 'DELETE',
        body: JSON.stringify(transferToAuthorId ? { transferToAuthorId } : {}),
      })
      toast.success('Blog author has been permanently deleted')
      onSuccess()
    } catch (e) {
      handleException(e as Parameters<typeof handleException>[0])
    } finally {
      setDeleting(false)
    }
  }

  const authorOptions = authors.map((a) => ({
    label: a.fullName,
    value: a.id,
  }))

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!deleting) onOpenChange(open)
      }}
      title="Permanently Delete Blog Author"
      description={`Permanently delete "${authorName}"? This cannot be undone — the author record will be removed entirely.`}
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
      <div className="pb-2">
        <Select
          label="Transfer blogs to (optional)"
          placeholder="No transfer — keep blogs orphaned"
          options={authorOptions}
          value={transferToAuthorId}
          onChange={(v) => setTransferToAuthorId(v as string | undefined)}
          disabled={deleting || loadingAuthors}
          clearable
        />
      </div>
    </Dialog>
  )
}
