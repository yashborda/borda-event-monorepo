'use client'

import type { IApiError, IServiceThemeWithMedia } from '@pkg/types'
import { Button, Checkbox, Dialog, Input, Skeleton, toast } from '@pkg/ui'
import {
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconPencil,
  IconPhoto,
  IconPlus,
  IconSelector,
  IconTrash,
  IconUpload,
  IconVideo,
} from '@tabler/icons-react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useEffect, useMemo, useState } from 'react'

import { apiFetch, directBackendUrl, getAccessToken } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { usePermissions } from '@/hooks/use-permissions'

interface IPanelProps {
  serviceId: string
  disabled?: boolean
}

type ISortKey = 'name' | 'price'
type ISortDir = 'asc' | 'desc'

// What the confirm dialog is about: a single theme, or the current selection.
type IDeleteTarget =
  | { kind: 'single'; id: string; name: string }
  | { kind: 'bulk'; ids: string[] }
  | null

export function ServiceThemesPanel({ serviceId, disabled }: IPanelProps) {
  const router = useRouter()
  const { can } = usePermissions()
  const canEdit = can('services:update') && !disabled

  const [themes, setThemes] = useState<IServiceThemeWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  // Inline price editing: themeId → draft string while focused.
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({})
  const [savingPrice, setSavingPrice] = useState<Set<string>>(new Set())

  // Sorting + multi-select.
  const [sort, setSort] = useState<{ key: ISortKey; dir: ISortDir }>({
    key: 'name',
    dir: 'asc',
  })
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Delete confirmation.
  const [deleteTarget, setDeleteTarget] = useState<IDeleteTarget>(null)
  const [deleting, setDeleting] = useState(false)

  // Drag-and-drop upload: which row is being hovered, and which rows are
  // currently uploading.
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const reload = async () => {
    try {
      const data = await apiFetch<{ themes: IServiceThemeWithMedia[] }>(
        `/api/admin/services/${serviceId}`
      )
      setThemes(data.themes ?? [])
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  useEffect(() => {
    apiFetch<{ themes: IServiceThemeWithMedia[] }>(
      `/api/admin/services/${serviceId}`
    )
      .then((data) => setThemes(data.themes ?? []))
      .catch((e: IApiError) => handleException(e))
      .finally(() => setLoading(false))
  }, [serviceId])

  const sortedThemes = useMemo(() => {
    const rows = [...themes]
    rows.sort((a, b) => {
      let cmp: number
      if (sort.key === 'price') {
        // Nulls sort last regardless of direction.
        const ap = a.price ?? Number.POSITIVE_INFINITY
        const bp = b.price ?? Number.POSITIVE_INFINITY
        cmp = ap - bp
      } else {
        cmp = a.name.localeCompare(b.name, undefined, { numeric: true })
      }
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [themes, sort])

  const toggleSort = (key: ISortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )

  const allSelected = themes.length > 0 && selected.size === themes.length
  const someSelected = selected.size > 0 && !allSelected

  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(themes.map((t) => t.id)))

  const toggleSelectOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleAdd = async () => {
    setAdding(true)
    try {
      const created = await apiFetch<{ id: string; name: string }>(
        `/api/admin/services/${serviceId}/themes`,
        { method: 'POST', body: JSON.stringify({}) }
      )
      toast.success(`Theme ${created.name} created`)
      router.push(`/services/${serviceId}/themes/${created.id}`)
    } catch (e) {
      handleException(e as IApiError)
      setAdding(false)
    }
  }

  const savePrice = async (theme: IServiceThemeWithMedia) => {
    const draft = priceDrafts[theme.id]
    if (draft === undefined) return // not edited
    const trimmed = draft.trim()
    const parsed = trimmed === '' ? null : Number(trimmed)

    // Clear the draft so the input falls back to the persisted value.
    setPriceDrafts((prev) => {
      const next = { ...prev }
      delete next[theme.id]
      return next
    })

    if (parsed !== null && (!Number.isInteger(parsed) || parsed < 0)) {
      toast.error('Price must be a whole number ≥ 0')
      return
    }
    if (parsed === (theme.price ?? null)) return // unchanged

    setSavingPrice((prev) => new Set(prev).add(theme.id))
    try {
      await apiFetch(`/api/admin/services/${serviceId}/themes/${theme.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ price: parsed }),
      })
      setThemes((prev) =>
        prev.map((t) => (t.id === theme.id ? { ...t, price: parsed } : t))
      )
      toast.success(`Price updated for ${theme.name}`)
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setSavingPrice((prev) => {
        const next = new Set(prev)
        next.delete(theme.id)
        return next
      })
    }
  }

  // Upload files dropped onto a theme row. Images attach via the media
  // endpoint; videos stream to the videos endpoint (direct backend URL for
  // large files), both scoped to this theme.
  const uploadToTheme = async (
    theme: IServiceThemeWithMedia,
    files: File[]
  ) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    const videos = files.filter((f) => f.type.startsWith('video/'))
    const skipped = files.length - images.length - videos.length

    if (images.length === 0 && videos.length === 0) {
      toast.error('Only image and video files can be dropped here')
      return
    }

    setUploadingId(theme.id)
    let failed = 0
    try {
      for (const file of images) {
        try {
          const form = new FormData()
          form.append('file', file)
          await apiFetch(
            `/api/admin/services/${serviceId}/media?themeId=${encodeURIComponent(theme.id)}`,
            { method: 'POST', body: form }
          )
        } catch (e) {
          failed++
          handleException(e as IApiError)
        }
      }

      for (const file of videos) {
        try {
          const form = new FormData()
          form.append('type', 'drive')
          form.append('themeId', theme.id)
          form.append('file', file)
          const token = getAccessToken()
          const res = await fetch(
            directBackendUrl(`/api/admin/services/${serviceId}/videos`),
            {
              method: 'POST',
              headers: token ? { authorization: `Bearer ${token}` } : {},
              credentials: 'include',
              body: form,
            }
          )
          if (!res.ok) {
            const body = await res.json().catch(() => ({
              message: res.statusText,
              statusCode: res.status,
            }))
            throw Object.assign(new Error(body.message ?? 'Upload failed'), {
              data: body,
              statusCode: res.status,
            })
          }
        } catch (e) {
          failed++
          handleException(e as IApiError)
        }
      }

      const ok = images.length + videos.length - failed
      if (ok > 0)
        toast.success(
          `${ok} file${ok > 1 ? 's' : ''} uploaded to ${theme.name}`
        )
      if (skipped > 0)
        toast.error(
          `${skipped} unsupported file${skipped > 1 ? 's' : ''} skipped`
        )
      await reload()
    } finally {
      setUploadingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.kind === 'single') {
        await apiFetch(
          `/api/admin/services/${serviceId}/themes/${deleteTarget.id}`,
          { method: 'DELETE' }
        )
        toast.success('Theme deleted')
      } else {
        await apiFetch(`/api/admin/services/${serviceId}/themes/bulk-delete`, {
          method: 'POST',
          body: JSON.stringify({ themeIds: deleteTarget.ids }),
        })
        toast.success(`${deleteTarget.ids.length} theme(s) deleted`)
      }
      setSelected(new Set())
      setDeleteTarget(null)
      await reload()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setDeleting(false)
    }
  }

  const deleteCount =
    deleteTarget?.kind === 'bulk' ? deleteTarget.ids.length : 1

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const SortIcon = ({ col }: { col: ISortKey }) => {
    if (sort.key !== col) return <IconSelector className="size-3.5" />
    return sort.dir === 'asc' ? (
      <IconChevronUp className="size-3.5" />
    ) : (
      <IconChevronDown className="size-3.5" />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Themes</h3>
          <p className="text-muted-foreground text-sm">
            Each theme has its own photos, videos, and price. Names are
            auto-generated (e.g. <code>baby-theme-01</code>).
            {canEdit && ' Drag images or videos onto a row to upload them.'}
          </p>
        </div>
        {canEdit && (
          <Button type="button" onClick={handleAdd} disabled={adding}>
            <IconPlus className="size-4" />
            {adding ? 'Creating…' : 'Add Theme'}
          </Button>
        )}
      </div>

      {/* Bulk action bar */}
      {canEdit && selected.size > 0 && (
        <div className="border-border/40 bg-muted/30 flex items-center justify-between rounded-lg border px-4 py-2">
          <span className="text-sm">
            {selected.size} selected
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground ml-3 underline"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </button>
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() =>
              setDeleteTarget({ kind: 'bulk', ids: [...selected] })
            }
          >
            <IconTrash className="size-4" />
            Delete selected
          </Button>
        </div>
      )}

      {themes.length === 0 ? (
        <div className="border-border/40 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No themes yet. Click <strong>Add Theme</strong> to create one — its
            name is auto-generated.
          </p>
        </div>
      ) : (
        <div className="border-border/40 max-h-150 overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
              <tr>
                {canEdit && (
                  <th className="w-10 px-4 py-2">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? 'indeterminate'
                            : false
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all themes"
                    />
                  </th>
                )}
                <th className="px-4 py-2 text-left font-medium">
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 font-medium"
                    onClick={() => toggleSort('name')}
                  >
                    Name
                    <SortIcon col="name" />
                  </button>
                </th>
                <th className="px-4 py-2 text-left font-medium">
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 font-medium"
                    onClick={() => toggleSort('price')}
                  >
                    Price
                    <SortIcon col="price" />
                  </button>
                </th>
                <th className="px-4 py-2 text-center font-medium">Photos</th>
                <th className="px-4 py-2 text-center font-medium">Videos</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedThemes.map((t) => {
                const draft = priceDrafts[t.id]
                const priceValue =
                  draft !== undefined
                    ? draft
                    : t.price != null
                      ? String(t.price)
                      : ''
                const isDragOver = dragOverId === t.id
                const isUploading = uploadingId === t.id
                return (
                  <tr
                    key={t.id}
                    className={
                      'border-border/40 border-t transition-colors ' +
                      (isDragOver
                        ? 'bg-primary/5 outline-primary outline-2 -outline-offset-2'
                        : '')
                    }
                    onDragOver={
                      canEdit
                        ? (e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'copy'
                            if (dragOverId !== t.id) setDragOverId(t.id)
                          }
                        : undefined
                    }
                    onDragLeave={
                      canEdit
                        ? (e) => {
                            // Only clear when the pointer actually leaves the row,
                            // not when moving between its cells.
                            if (
                              !e.currentTarget.contains(
                                e.relatedTarget as Node | null
                              )
                            )
                              setDragOverId((cur) =>
                                cur === t.id ? null : cur
                              )
                          }
                        : undefined
                    }
                    onDrop={
                      canEdit
                        ? (e) => {
                            e.preventDefault()
                            setDragOverId(null)
                            const files = Array.from(e.dataTransfer.files)
                            if (files.length && !isUploading)
                              void uploadToTheme(t, files)
                          }
                        : undefined
                    }
                  >
                    {canEdit && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selected.has(t.id)}
                          onCheckedChange={() => toggleSelectOne(t.id)}
                          aria-label={`Select ${t.name}`}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Link
                        href={`/services/${serviceId}/themes/${t.id}`}
                        className="text-foreground font-medium hover:underline"
                      >
                        {t.name}
                      </Link>
                      {isUploading ? (
                        <p className="text-primary mt-0.5 flex items-center gap-1 text-xs">
                          <IconLoader2 className="size-3.5 animate-spin" />
                          Uploading…
                        </p>
                      ) : isDragOver ? (
                        <p className="text-primary mt-0.5 flex items-center gap-1 text-xs">
                          <IconUpload className="size-3.5" />
                          Drop images or videos to upload
                        </p>
                      ) : (
                        t.description && (
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {t.description.length > 60
                              ? `${t.description.slice(0, 60)}…`
                              : t.description}
                          </p>
                        )
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canEdit ? (
                        <Input
                          type="number"
                          min={0}
                          size="sm"
                          className="w-28"
                          placeholder="—"
                          value={priceValue}
                          disabled={savingPrice.has(t.id)}
                          onChange={(e) =>
                            setPriceDrafts((prev) => ({
                              ...prev,
                              [t.id]: e.target.value,
                            }))
                          }
                          onBlur={() => savePrice(t)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              ;(e.target as HTMLInputElement).blur()
                            }
                          }}
                        />
                      ) : t.price != null ? (
                        `₹ ${t.price.toLocaleString('en-IN')}`
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <IconPhoto className="size-3.5" />
                        {t.media.length}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <IconVideo className="size-3.5" />
                        {t.videos.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost-muted"
                          size="sm"
                          className="size-8 p-0"
                        >
                          <Link href={`/services/${serviceId}/themes/${t.id}`}>
                            <IconPencil className="size-4" />
                          </Link>
                        </Button>
                        {canEdit && (
                          <Button
                            type="button"
                            variant="ghost-muted"
                            size="sm"
                            className="text-destructive hover:text-destructive size-8 p-0"
                            onClick={() =>
                              setDeleteTarget({
                                kind: 'single',
                                id: t.id,
                                name: t.name,
                              })
                            }
                          >
                            <IconTrash className="size-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}
        title={deleteCount > 1 ? 'Delete themes' : 'Delete theme'}
        description={
          deleteTarget?.kind === 'single'
            ? `Delete "${deleteTarget.name}"? Its photos and videos will also be removed. This cannot be undone.`
            : `Delete ${deleteCount} selected theme(s)? Their photos and videos will also be removed. This cannot be undone.`
        }
        actions={[
          {
            label: 'Cancel',
            variant: 'outline-muted',
            onClick: () => setDeleteTarget(null),
            disabled: deleting,
            className: 'ml-auto',
          },
          {
            label: deleting ? 'Deleting…' : 'Yes, delete',
            variant: 'destructive',
            onClick: confirmDelete,
            disabled: deleting,
          },
        ]}
      />
    </div>
  )
}
