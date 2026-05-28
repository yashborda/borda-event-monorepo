'use client'

import type { IApiError, IPermission, IRoleWithPermissions } from '@pkg/types'
import { Dialog, Input, toast } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { usePermissions } from '@/hooks/use-permissions'

import { RoleDetailSkeleton } from './role-detail-skeleton'
import { RolePermissionsPanel } from './role-permissions-panel'
import { usePermissionSelection } from './use-permission-selection'

export type IRoleEditFormRef = {
  save: () => void
}

type IRoleEditFormProps = {
  roleId: string
  onLoad?: (info: { title: string; isSystem: boolean }) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  footer?: React.ReactNode
}

export const RoleEditForm = forwardRef<IRoleEditFormRef, IRoleEditFormProps>(
  ({ roleId, onLoad, onLoadingChange, onSaveSuccess, footer }, ref) => {
    const router = useRouter()
    const { can } = usePermissions()

    const canUpdate = can('roles:update')

    const [role, setRole] = useState<IRoleWithPermissions | null>(null)
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [nameError, setNameError] = useState('')
    const [slugError, setSlugError] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const {
      grouped,
      filteredResources,
      selectedIds: pendingIds,
      selectedResource,
      setSelectedResource,
      search,
      setSearch,
      togglePerm,
      toggleAllForResource,
      resetIds,
      setAllPermissions,
    } = usePermissionSelection()

    const reload = () =>
      Promise.all([
        apiFetch<IRoleWithPermissions>(`/api/admin/roles/${roleId}`),
        apiFetch<IPermission[]>('/api/admin/permissions'),
      ]).then(([r, perms]) => {
        setRole(r)
        setName(r.name)
        setSlug(r.slug ?? '')
        setAllPermissions(perms)
        resetIds(r.permissions.map((p) => p.id))
        setSelectedResource((prev) => {
          const resources = [...new Set(perms.map((p) => p.resource))]
          return prev && resources.includes(prev)
            ? prev
            : (resources[0] ?? null)
        })
        onLoad?.({ title: r.name, isSystem: r.isSystem })
      })

    useEffect(() => {
      setLoading(true)
      onLoadingChange?.(true)
      reload()
        .catch((e: IApiError) => {
          handleException(e)
          if (e?.statusCode === 404) {
            router.replace('/roles')
          }
        })
        .finally(() => {
          setLoading(false)
          onLoadingChange?.(false)
        })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleId])

    const serverIds = useMemo(
      () => new Set(role?.permissions.map((p) => p.id) ?? []),
      [role]
    )

    const toAdd = useMemo(
      () => [...pendingIds].filter((pid) => !serverIds.has(pid)),
      [pendingIds, serverIds]
    )
    const toRemove = useMemo(
      () => [...serverIds].filter((pid) => !pendingIds.has(pid)),
      [pendingIds, serverIds]
    )

    const nameChanged = name.trim() !== role?.name
    const slugChanged = slug.trim() !== (role?.slug ?? '')

    const saveAll = async () => {
      setSaving(true)
      try {
        await Promise.all([
          nameChanged || slugChanged
            ? apiFetch(`/api/admin/roles/${roleId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                  ...(nameChanged && { name: name.trim() }),
                  ...(slugChanged && { slug: slug.trim() || null }),
                }),
              })
            : Promise.resolve(),
          toRemove.length > 0
            ? Promise.all(
                toRemove.map((permId) =>
                  apiFetch(`/api/admin/roles/${roleId}/permissions/${permId}`, {
                    method: 'DELETE',
                  })
                )
              )
            : Promise.resolve(),
          toAdd.length > 0
            ? apiFetch(`/api/admin/roles/${roleId}/permissions`, {
                method: 'POST',
                body: JSON.stringify({ permissionIds: toAdd }),
              })
            : Promise.resolve(),
        ])
        // Update local state directly — no refetch needed
        const savedName = name.trim()
        const savedSlug = slug.trim() || null
        const allPerms = Object.values(grouped).flat()
        const updatedPermissions = allPerms.filter((p) => pendingIds.has(p.id))
        setRole((prev) =>
          prev
            ? {
                ...prev,
                name: savedName,
                slug: savedSlug,
                permissions: updatedPermissions,
              }
            : prev
        )
        onLoad?.({ title: savedName, isSystem: role?.isSystem ?? false })
        setConfirmOpen(false)
        toast.success('Role updated successfully')
        onSaveSuccess?.()
      } catch (e) {
        handleException(e as IApiError)
      } finally {
        setSaving(false)
      }
    }

    const handleSaveClick = () => {
      let valid = true
      if (!name.trim()) {
        setNameError('Name is required')
        valid = false
      }
      if (!slug.trim()) {
        setSlugError('Slug is required')
        valid = false
      }
      if (!valid) return
      setConfirmOpen(true)
    }

    useImperativeHandle(ref, () => ({
      save: handleSaveClick,
    }))

    if (loading || !role) return <RoleDetailSkeleton showFooter={!!footer} />

    return (
      <div className="flex flex-col gap-6">
        {/* Name + Slug fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            id="name"
            label="Name"
            required
            maxLength={255}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError('')
            }}
            errorMessage={nameError}
            disabled={role.isSystem || !canUpdate || saving}
            placeholder="Name"
          />
          <Input
            id="slug"
            label="Slug"
            required
            maxLength={255}
            placeholder="my_role"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
              if (slugError) setSlugError('')
            }}
            errorMessage={slugError}
            disabled={role.isSystem || !canUpdate || saving}
          />
        </div>

        <RolePermissionsPanel
          grouped={grouped}
          filteredResources={filteredResources}
          selectedIds={pendingIds}
          selectedResource={selectedResource}
          search={search}
          onSearchChange={setSearch}
          onSelectResource={setSelectedResource}
          onTogglePerm={togglePerm}
          onToggleAllForResource={toggleAllForResource}
          disabled={role.isSystem || !canUpdate}
          onRefresh={() => reload()}
        />

        {footer}

        {/* Confirm save dialog */}
        <Dialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Save Changes"
          description="Are you sure you want to save the changes to this role?"
          actions={[
            {
              label: 'Cancel',
              variant: 'outline-muted',
              onClick: () => setConfirmOpen(false),
              disabled: saving,
              className: 'ml-auto',
            },
            {
              label: saving ? 'Saving…' : 'Confirm',
              onClick: saveAll,
              disabled: saving,
            },
          ]}
        />
      </div>
    )
  }
)

RoleEditForm.displayName = 'RoleEditForm'
