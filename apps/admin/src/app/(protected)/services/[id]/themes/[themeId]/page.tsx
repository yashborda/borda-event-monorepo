'use client'

import type {
  IApiError,
  IService,
  IServiceDetail,
  IServiceThemeVideo,
  IServiceThemeWithMedia,
  IThemeLinkedService,
} from '@pkg/types'
import { Badge, Button, Input, Select, Skeleton, Textarea, toast } from '@pkg/ui'
import {
  IconBrandInstagram,
  IconLink,
  IconPencil,
  IconPhotoPlus,
  IconStar,
  IconStarFilled,
  IconVideoPlus,
  IconX,
} from '@tabler/icons-react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { use, useEffect, useRef, useState } from 'react'

import { apiFetch, directBackendUrl, getAccessToken } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { usePermissions } from '@/hooks/use-permissions'

import { RenameDialog } from '@/components/rename-dialog'

import { PageHeader } from '../../../../_components/page-header'
import { PermissionGuard } from '../../../../_components/permission-guard'

type IThemePhoto = IServiceThemeWithMedia['media'][number]

/**
 * Turn an Instagram post / reel / tv URL into its public embed URL. Supports
 * /reel/, /reels/ (Insta canonicalises to singular), /p/ (photo posts), /tv/.
 * Returns null for unrecognisable URLs — caller falls back to a plain link.
 */
function instagramEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const m = url.match(/instagram\.com\/(reel|reels|p|tv)\/([^/?#]+)/i)
  if (!m) return null
  const kind = m[1].toLowerCase() === 'reels' ? 'reel' : m[1].toLowerCase()
  return `https://www.instagram.com/${kind}/${m[2]}/embed`
}

type IPageProps = {
  params: Promise<{ id: string; themeId: string }>
}

const ThemeEditPage = ({ params }: IPageProps) => {
  const { id, themeId } = use(params)
  const router = useRouter()
  const { can } = usePermissions()
  const canEdit = can('services:update')
  const canManageVideos = can('service-videos:update')

  const [service, setService] = useState<IServiceDetail | null>(null)
  const [theme, setTheme] = useState<IServiceThemeWithMedia | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    try {
      const data = await apiFetch<IServiceDetail>(`/api/admin/services/${id}`)
      setService(data)
      const t = data.themes.find((th) => th.id === themeId) ?? null
      setTheme(t)
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  useEffect(() => {
    apiFetch<IServiceDetail>(`/api/admin/services/${id}`)
      .then((data) => {
        setService(data)
        setTheme(data.themes.find((th) => th.id === themeId) ?? null)
      })
      .catch((e: IApiError) => handleException(e))
      .finally(() => setLoading(false))
  }, [id, themeId])

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!service || !theme) {
    return (
      <div className="border-border/40 rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">Theme not found.</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/services/${id}`)}
        >
          Back to service
        </Button>
      </div>
    )
  }

  return (
    <PermissionGuard permission="services:read" redirectTo="/services">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={theme.name}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Services', href: '/services' },
            { label: service.name, href: `/services/${id}` },
            { label: theme.name },
          ]}
          badge={
            !canEdit ? <Badge variant="secondary">View only</Badge> : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <ThemeInfoForm
            serviceId={id}
            theme={theme}
            canEdit={canEdit}
            onSaved={reload}
          />
        </div>

        <div className="border-border/40 shadow-shadow rounded-xl border p-4 shadow-lg sm:p-6">
          <ThemeSharingSection
            currentServiceId={id}
            themeId={themeId}
            linkedServices={theme.linkedServices}
            canEdit={canEdit}
            onChanged={reload}
          />
        </div>

        <div className="border-border/40 shadow-shadow rounded-xl border p-4 shadow-lg sm:p-6">
          <ThemePhotosSection
            serviceId={id}
            themeId={themeId}
            photos={theme.media}
            canEdit={canEdit}
            onChanged={reload}
          />
        </div>

        <div className="border-border/40 shadow-shadow rounded-xl border p-4 shadow-lg sm:p-6">
          <ThemeVideosSection
            serviceId={id}
            themeId={themeId}
            videos={theme.videos}
            canEdit={canEdit && canManageVideos}
            onChanged={reload}
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default ThemeEditPage

// ── Theme info form ───────────────────────────────────────────
function ThemeInfoForm({
  serviceId,
  theme,
  canEdit,
  onSaved,
}: {
  serviceId: string
  theme: IServiceThemeWithMedia
  canEdit: boolean
  onSaved: () => Promise<void>
}) {
  const [price, setPrice] = useState(theme.price?.toString() ?? '')
  const [description, setDescription] = useState(theme.description ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPrice(theme.price?.toString() ?? '')
    setDescription(theme.description ?? '')
  }, [theme.id, theme.price, theme.description])

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = {
        price: price === '' ? null : Number(price),
        description: description.trim() === '' ? null : description.trim(),
      }
      await apiFetch(`/api/admin/services/${serviceId}/themes/${theme.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      toast.success('Theme saved')
      await onSaved()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-foreground text-lg font-semibold">Details</h3>
        <p className="text-muted-foreground text-sm">
          The name is auto-generated and read-only. Set the price and
          description.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="theme-name"
          label="Theme Name"
          value={theme.name}
          readOnly
          disabled
        />
        <Input
          id="theme-price"
          label="Price (₹)"
          type="number"
          disabled={!canEdit || saving}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <Textarea
        id="theme-description"
        label="Description"
        disabled={!canEdit || saving}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {canEdit && (
        <div className="flex justify-end">
          <Button type="button" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Shared-with-services section ──────────────────────────────
// Shows every service this (shared) theme belongs to, and lets you add it to
// another service. The theme's photos/videos are shared — nothing is copied.
function ThemeSharingSection({
  currentServiceId,
  themeId,
  linkedServices,
  canEdit,
  onChanged,
}: {
  currentServiceId: string
  themeId: string
  linkedServices: IThemeLinkedService[]
  canEdit: boolean
  onChanged: () => Promise<void>
}) {
  const [services, setServices] = useState<IService[]>([])
  const [targetId, setTargetId] = useState<string>('')
  const [adding, setAdding] = useState(false)

  // All active services, to offer as link targets. Fetched once.
  useEffect(() => {
    apiFetch<{ data: IService[] }>('/api/admin/services?limit=100')
      .then((res) => setServices(res.data))
      .catch((e: IApiError) => handleException(e))
  }, [])

  // Defensive: older API responses may omit linkedServices.
  const linked = linkedServices ?? []
  const linkedIds = new Set(linked.map((s) => s.id))
  // Candidates: services that DON'T already have this theme (and not deleted).
  const options = services
    .filter((s) => !linkedIds.has(s.id) && !s.deletedAt)
    .map((s) => ({ value: s.id, label: s.name }))

  const addToService = async () => {
    if (!targetId) return
    setAdding(true)
    try {
      await apiFetch(
        `/api/admin/services/${targetId}/themes/${themeId}/link`,
        { method: 'POST' }
      )
      toast.success('Theme added to service')
      setTargetId('')
      await onChanged()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setAdding(false)
    }
  }

  // Remove this theme from a service it's shared into (not the current one
  // unless it's also listed). Uses the same unlink endpoint as the panel.
  const removeFromService = async (serviceId: string, name: string) => {
    if (!window.confirm(`Remove this theme from "${name}"?`)) return
    try {
      await apiFetch(
        `/api/admin/services/${serviceId}/themes/${themeId}`,
        { method: 'DELETE' }
      )
      toast.success(`Removed from ${name}`)
      await onChanged()
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-foreground text-lg font-semibold">
          Shared with services
        </h3>
        <p className="text-muted-foreground text-sm">
          This theme can appear under multiple services. Its photos and videos
          are shared — nothing is duplicated.
        </p>
      </div>

      {/* Current memberships */}
      <div className="flex flex-wrap gap-2">
        {linked.length === 0 ? (
          <span className="text-muted-foreground text-sm">
            Not linked to any service yet.
          </span>
        ) : (
          linked.map((s) => {
            const isCurrent = s.id === currentServiceId
            return (
              <span
                key={s.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                  isCurrent
                    ? 'border-primary/50 bg-primary/10 text-foreground'
                    : 'border-border/60 text-muted-foreground'
                }`}
              >
                {s.name}
                {isCurrent && (
                  <span className="text-primary text-xs">(current)</span>
                )}
                {canEdit && !isCurrent && (
                  <button
                    type="button"
                    onClick={() => removeFromService(s.id, s.name)}
                    className="hover:text-destructive transition"
                    aria-label={`Remove from ${s.name}`}
                    title={`Remove from ${s.name}`}
                  >
                    <IconX className="size-3.5" />
                  </button>
                )}
              </span>
            )
          })
        )}
      </div>

      {/* Add to another service */}
      {canEdit && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sm:w-72">
            <Select
              id="add-theme-service"
              label="Add to another service"
              placeholder={
                options.length === 0
                  ? 'No other services available'
                  : 'Select a service…'
              }
              options={options}
              value={targetId || undefined}
              onChange={(v) => setTargetId(v ?? '')}
              disabled={options.length === 0 || adding}
            />
          </div>
          <Button
            type="button"
            onClick={addToService}
            disabled={!targetId || adding}
          >
            <IconLink className="size-4" />
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Photos with featured star toggle ──────────────────────────
function ThemePhotosSection({
  serviceId,
  themeId,
  photos,
  canEdit,
  onChanged,
}: {
  serviceId: string
  themeId: string
  photos: IThemePhoto[]
  canEdit: boolean
  onChanged: () => Promise<void>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState<{
    done: number
    total: number
  } | null>(null)
  const [renameTarget, setRenameTarget] = useState<{
    id: string
    currentName: string
  } | null>(null)

  // Sequential upload — Drive throttles concurrent uploads from a single user
  // and large batches can swamp the connection; one-at-a-time is safer.
  // Failures don't abort the batch; subsequent files still attempt.
  const uploadMany = async (files: File[]) => {
    if (files.length === 0) return
    setUploadProgress({ done: 0, total: files.length })
    let failed = 0
    for (let i = 0; i < files.length; i++) {
      try {
        const form = new FormData()
        form.append('file', files[i])
        await apiFetch(
          `/api/admin/services/${serviceId}/media?themeId=${encodeURIComponent(themeId)}`,
          { method: 'POST', body: form }
        )
      } catch (e) {
        failed++
        handleException(e as IApiError)
      } finally {
        setUploadProgress({ done: i + 1, total: files.length })
      }
    }
    setUploadProgress(null)
    if (files.length > 1 && failed < files.length) {
      toast.success(
        failed === 0
          ? `${files.length} photos uploaded`
          : `${files.length - failed} of ${files.length} uploaded`
      )
    }
    await onChanged()
  }

  const setFeatured = async (mediaId: string) => {
    try {
      await apiFetch(
        `/api/admin/services/${serviceId}/media/${mediaId}/featured`,
        { method: 'PATCH', body: JSON.stringify({}) }
      )
      await onChanged()
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  const remove = async (mediaId: string) => {
    if (!window.confirm('Delete this photo?')) return
    try {
      await apiFetch(`/api/admin/services/${serviceId}/media/${mediaId}`, {
        method: 'DELETE',
      })
      await onChanged()
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Photos</h3>
          <p className="text-muted-foreground text-sm">
            Click the star to set the cover photo for this theme. The cover
            shows on the service page.
          </p>
        </div>
        {canEdit && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : []
                e.target.value = ''
                if (files.length > 0) void uploadMany(files)
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploadProgress !== null}
              onClick={() => fileInputRef.current?.click()}
            >
              <IconPhotoPlus className="size-4" />
              {uploadProgress
                ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
                : 'Add Photos'}
            </Button>
          </>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No photos for this theme yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => (
            <div
              key={p.id}
              className={`group relative aspect-square overflow-hidden rounded-lg border ${
                p.isFeatured
                  ? 'border-amber-500/70 ring-2 ring-amber-500/40'
                  : 'border-border/40'
              }`}
            >
              <Image
                src={p.url}
                alt={p.originalName}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
              {p.isFeatured && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-medium text-white">
                  <IconStarFilled className="size-3" />
                  Cover
                </span>
              )}
              {canEdit && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  {!p.isFeatured && (
                    <button
                      type="button"
                      onClick={() => setFeatured(p.id)}
                      className="bg-background/80 text-foreground rounded p-1 transition hover:bg-amber-500 hover:text-white"
                      aria-label="Set as cover"
                      title="Set as cover"
                    >
                      <IconStar className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setRenameTarget({
                        id: p.id,
                        currentName: p.originalName,
                      })
                    }
                    className="bg-background/80 text-foreground hover:bg-foreground hover:text-background rounded p-1 transition"
                    aria-label="Rename photo"
                    title={`Rename — currently "${p.originalName}"`}
                  >
                    <IconPencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="bg-background/80 hover:bg-destructive/90 hover:text-destructive-foreground text-foreground rounded p-1 transition"
                    aria-label="Delete photo"
                  >
                    <IconX className="size-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <RenameDialog
        open={!!renameTarget}
        title="Rename photo"
        description="Updates the display name AND renames the file on Drive."
        initialValue={renameTarget?.currentName ?? ''}
        onClose={() => setRenameTarget(null)}
        onSave={async (name) => {
          await apiFetch(
            `/api/admin/services/${serviceId}/media/${renameTarget!.id}/name`,
            { method: 'PATCH', body: JSON.stringify({ name }) }
          )
          toast.success('Photo renamed')
          await onChanged()
        }}
      />
    </div>
  )
}

// ── Videos with featured star toggle ──────────────────────────
function ThemeVideosSection({
  serviceId,
  themeId,
  videos,
  canEdit,
  onChanged,
}: {
  serviceId: string
  themeId: string
  videos: IServiceThemeVideo[]
  canEdit: boolean
  onChanged: () => Promise<void>
}) {
  const [addingKind, setAddingKind] = useState<'instagram' | 'drive' | null>(
    null
  )
  const [instagramUrl, setInstagramUrl] = useState('')
  const driveInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    done: number
    total: number
  } | null>(null)
  const [renameTarget, setRenameTarget] = useState<{
    id: string
    currentTitle: string
  } | null>(null)

  const submitInstagram = async () => {
    if (!instagramUrl.trim()) return
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('type', 'instagram')
      form.append('instagramUrl', instagramUrl.trim())
      form.append('themeId', themeId)
      await apiFetch(`/api/admin/services/${serviceId}/videos`, {
        method: 'POST',
        body: form,
      })
      setInstagramUrl('')
      setAddingKind(null)
      await onChanged()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setSubmitting(false)
    }
  }

  // Sequential — videos are large (up to 500 MB each), parallel uploads would
  // saturate the connection and Drive throttles concurrent uploads anyway.
  // Posts directly to the backend (via directBackendUrl) when configured, to
  // bypass the Next.js dev rewrite proxy which silently aborts large bodies.
  const submitDriveMany = async (files: File[]) => {
    if (files.length === 0) return
    setUploadProgress({ done: 0, total: files.length })
    let failed = 0
    for (let i = 0; i < files.length; i++) {
      try {
        const form = new FormData()
        form.append('type', 'drive')
        form.append('themeId', themeId)
        form.append('file', files[i])
        const url = directBackendUrl(`/api/admin/services/${serviceId}/videos`)
        const token = getAccessToken()
        const headers: HeadersInit = token
          ? { authorization: `Bearer ${token}` }
          : {}
        const res = await fetch(url, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: form,
        })
        if (!res.ok) {
          const body = await res
            .json()
            .catch(() => ({ message: res.statusText, statusCode: res.status }))
          throw Object.assign(new Error(body.message ?? 'Upload failed'), {
            data: body,
            statusCode: res.status,
          })
        }
      } catch (e) {
        failed++
        handleException(e as IApiError)
      } finally {
        setUploadProgress({ done: i + 1, total: files.length })
      }
    }
    setUploadProgress(null)
    setAddingKind(null)
    if (files.length > 1 && failed < files.length) {
      toast.success(
        failed === 0
          ? `${files.length} videos uploaded`
          : `${files.length - failed} of ${files.length} uploaded`
      )
    }
    await onChanged()
  }

  const setFeatured = async (videoId: string) => {
    try {
      await apiFetch(
        `/api/admin/services/${serviceId}/videos/${videoId}/featured`,
        { method: 'PATCH', body: JSON.stringify({}) }
      )
      await onChanged()
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  const remove = async (videoId: string) => {
    if (!window.confirm('Delete this video?')) return
    try {
      await apiFetch(`/api/admin/services/${serviceId}/videos/${videoId}`, {
        method: 'DELETE',
      })
      await onChanged()
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Videos</h3>
          <p className="text-muted-foreground text-sm">
            Click the star to set the cover video. Uploaded videos play directly
            here once the upload finishes.
          </p>
        </div>
        {canEdit && addingKind === null && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddingKind('instagram')}
            >
              <IconBrandInstagram className="size-4" />
              Instagram URL
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddingKind('drive')}
            >
              <IconVideoPlus className="size-4" />
              Upload Video
            </Button>
          </div>
        )}
      </div>

      {addingKind === 'instagram' && (
        <div className="bg-muted/40 flex flex-col gap-2 rounded-lg p-3 sm:flex-row">
          <Input
            id={`ig-${themeId}`}
            placeholder="https://www.instagram.com/reel/…"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddingKind(null)
                setInstagramUrl('')
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting || !instagramUrl.trim()}
              onClick={submitInstagram}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {addingKind === 'drive' && (
        <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-lg p-3">
          <input
            ref={driveInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/ogg"
            multiple
            hidden
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : []
              e.target.value = ''
              if (files.length > 0) void submitDriveMany(files)
            }}
          />
          <span className="text-muted-foreground text-sm">
            Select one or more MP4/WebM/MOV/OGG files (max 500 MB each).
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploadProgress !== null}
              onClick={() => setAddingKind(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={uploadProgress !== null}
              onClick={() => driveInputRef.current?.click()}
            >
              {uploadProgress
                ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
                : 'Choose Files'}
            </Button>
          </div>
        </div>
      )}

      {videos.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No videos for this theme yet.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            // Instagram reels use the official embed iframe; uploaded (R2)
            // videos play directly with a native <video> element.
            const instagramEmbed =
              v.type === 'instagram' ? instagramEmbedUrl(v.instagramUrl) : null
            const aspectClass = 'aspect-[9/16]'
            return (
              <li
                key={v.id}
                className={`flex flex-col gap-3 rounded-lg border p-3 ${
                  v.isFeatured
                    ? 'border-amber-500/70 ring-2 ring-amber-500/40'
                    : 'border-border/40'
                }`}
              >
                {v.type === 'drive' && v.driveUrl ? (
                  <div
                    className={`bg-muted overflow-hidden rounded-md ${aspectClass}`}
                  >
                    <video
                      src={v.driveUrl}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      className="size-full bg-black object-cover"
                    />
                  </div>
                ) : instagramEmbed ? (
                  <div
                    className={`bg-muted overflow-hidden rounded-md ${aspectClass}`}
                  >
                    <iframe
                      src={instagramEmbed}
                      title={`Instagram ${v.instagramUrl ?? ''}`}
                      loading="lazy"
                      allow="autoplay; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="size-full border-0"
                    />
                  </div>
                ) : (
                  <div
                    className={`bg-muted text-muted-foreground flex items-center justify-center rounded-md text-xs ${aspectClass}`}
                  >
                    Preview unavailable
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 overflow-hidden">
                    {v.type === 'instagram' ? (
                      <IconBrandInstagram className="mt-0.5 size-4 shrink-0" />
                    ) : (
                      <IconVideoPlus className="mt-0.5 size-4 shrink-0" />
                    )}
                    <div className="overflow-hidden">
                      <a
                        href={v.driveUrl ?? v.instagramUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground block truncate text-xs hover:underline"
                        title={v.title ?? undefined}
                      >
                        {v.title ??
                          (v.type === 'instagram'
                            ? (v.instagramUrl ?? 'Instagram video')
                            : `Drive video (${v.driveFileId ?? 'unknown'})`)}
                      </a>
                      {v.isFeatured && (
                        <span className="text-xs font-medium text-amber-600">
                          Cover video
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {canEdit && (
                      <>
                        {!v.isFeatured && (
                          <Button
                            type="button"
                            variant="ghost-muted"
                            size="sm"
                            className="size-7 p-0"
                            onClick={() => setFeatured(v.id)}
                            title="Set as cover"
                          >
                            <IconStar className="size-4" />
                          </Button>
                        )}
                        {v.isFeatured && (
                          <Button
                            type="button"
                            variant="ghost-muted"
                            size="sm"
                            className="size-7 p-0 text-amber-500 hover:text-amber-600"
                            disabled
                            title="Cover video"
                          >
                            <IconStarFilled className="size-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost-muted"
                          size="sm"
                          className="size-7 p-0"
                          onClick={() =>
                            setRenameTarget({
                              id: v.id,
                              currentTitle:
                                v.title ??
                                (v.type === 'instagram'
                                  ? (v.instagramUrl ?? '')
                                  : ''),
                            })
                          }
                          title="Rename"
                        >
                          <IconPencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost-muted"
                          size="sm"
                          className="size-7 p-0"
                          onClick={() => remove(v.id)}
                        >
                          <IconX className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <RenameDialog
        open={!!renameTarget}
        title="Rename video"
        description="Updates the display name. For Drive videos this also renames the file on Drive."
        initialValue={renameTarget?.currentTitle ?? ''}
        onClose={() => setRenameTarget(null)}
        onSave={async (title) => {
          await apiFetch(
            `/api/admin/services/${serviceId}/videos/${renameTarget!.id}/name`,
            { method: 'PATCH', body: JSON.stringify({ title }) }
          )
          toast.success('Video renamed')
          await onChanged()
        }}
      />
    </div>
  )
}
