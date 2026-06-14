'use client'

import type { IApiError, IServiceThemeWithMedia } from '@pkg/types'
import { Button, Skeleton, toast } from '@pkg/ui'
import {
  IconPencil,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconVideo,
} from '@tabler/icons-react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { usePermissions } from '@/hooks/use-permissions'

interface IPanelProps {
  serviceId: string
  disabled?: boolean
}

export function ServiceThemesPanel({ serviceId, disabled }: IPanelProps) {
  const router = useRouter()
  const { can } = usePermissions()
  const canEdit = can('services:update') && !disabled

  const [themes, setThemes] = useState<IServiceThemeWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

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

  const handleDelete = async (themeId: string, name: string) => {
    if (
      !window.confirm(
        `Delete theme "${name}"? Its photos and videos will also be removed.`
      )
    )
      return
    try {
      await apiFetch(`/api/admin/services/${serviceId}/themes/${themeId}`, {
        method: 'DELETE',
      })
      toast.success('Theme deleted')
      await reload()
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
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
          </p>
        </div>
        {canEdit && (
          <Button type="button" onClick={handleAdd} disabled={adding}>
            <IconPlus className="size-4" />
            {adding ? 'Creating…' : 'Add Theme'}
          </Button>
        )}
      </div>

      {themes.length === 0 ? (
        <div className="border-border/40 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No themes yet. Click <strong>Add Theme</strong> to create one — its
            name is auto-generated.
          </p>
        </div>
      ) : (
        <div className="border-border/40 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Price</th>
                <th className="px-4 py-2 text-center font-medium">Photos</th>
                <th className="px-4 py-2 text-center font-medium">Videos</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {themes.map((t) => (
                <tr key={t.id} className="border-border/40 border-t">
                  <td className="px-4 py-3">
                    <Link
                      href={`/services/${serviceId}/themes/${t.id}`}
                      className="text-foreground font-medium hover:underline"
                    >
                      {t.name}
                    </Link>
                    {t.description && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {t.description.length > 60
                          ? `${t.description.slice(0, 60)}…`
                          : t.description}
                      </p>
                    )}
                  </td>
                  <td className="text-foreground px-4 py-3">
                    {t.price != null
                      ? `₹ ${t.price.toLocaleString('en-IN')}`
                      : '—'}
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
                          onClick={() => handleDelete(t.id, t.name)}
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
