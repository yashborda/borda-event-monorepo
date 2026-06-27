'use client'

import type { IApiError, IServiceThemeWithMedia } from '@pkg/types'
import {
  Button,
  Dialog,
  Input,
  Skeleton,
  cn,
  toast,
} from '@pkg/ui'
import { IconPhoto, IconSearch } from '@tabler/icons-react'

import Image from 'next/image'

import { useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

/** Featured image first, else the first photo, else null. */
const cover = (t: IServiceThemeWithMedia): string | null => {
  if (t.media.length === 0) return null
  return (t.media.find((m) => m.isFeatured) ?? t.media[0])?.url ?? null
}

/**
 * Picker for adding an EXISTING theme (from another service) into this service,
 * so the same theme — with its shared photos/videos — appears here too. No media
 * is copied. Lists themes not already linked here, filterable by name.
 */
export function AddExistingThemeDialog({
  serviceId,
  open,
  onOpenChange,
  onLinked,
}: {
  serviceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onLinked: () => void
}) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<IServiceThemeWithMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [linkingId, setLinkingId] = useState<string | null>(null)

  // Debounced fetch of available themes whenever the dialog is open / search
  // changes. Closing resets the query so it re-runs fresh next time.
  useEffect(() => {
    if (!open) {
      setSearch('')
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    const id = setTimeout(() => {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      apiFetch<IServiceThemeWithMedia[]>(
        `/api/admin/services/${serviceId}/themes/available?${params.toString()}`
      )
        .then((data) => {
          if (!cancelled) setResults(data)
        })
        .catch((e: IApiError) => !cancelled && handleException(e))
        .finally(() => !cancelled && setLoading(false))
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [open, search, serviceId])

  const link = async (theme: IServiceThemeWithMedia) => {
    setLinkingId(theme.id)
    try {
      await apiFetch(
        `/api/admin/services/${serviceId}/themes/${theme.id}/link`,
        { method: 'POST' }
      )
      toast.success(`"${theme.name}" added to this service`)
      setResults((prev) => prev.filter((t) => t.id !== theme.id))
      onLinked()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setLinkingId(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add an existing theme"
      description="Reuse a theme from another service. Its photos and videos are shared — nothing is duplicated."
    >
      <div className="flex flex-col gap-3">
        <Input
          autoFocus
          placeholder="Search themes by name…"
          icon={<IconSearch />}
          iconPosition="left"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-96 overflow-auto">
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {search.trim()
                ? 'No matching themes available to add.'
                : 'No other themes available to add.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {results.map((t) => {
                const img = cover(t)
                // Where this theme already lives, for context in the picker.
                const inServices = t.linkedServices
                  .map((s) => s.name)
                  .join(', ')
                return (
                  <li
                    key={t.id}
                    className="border-border/40 flex items-center gap-3 rounded-lg border p-2"
                  >
                    {img ? (
                      <div className="relative size-12 shrink-0 overflow-hidden rounded">
                        <Image
                          src={img}
                          alt={t.name}
                          fill
                          sizes="48px"
                          loading="lazy"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded">
                        <IconPhoto className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {t.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {t.media.length} photo{t.media.length === 1 ? '' : 's'}
                        {inServices && ` · in ${inServices}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={linkingId === t.id}
                      onClick={() => link(t)}
                      className={cn(linkingId === t.id && 'opacity-70')}
                    >
                      {linkingId === t.id ? 'Adding…' : 'Add'}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  )
}
