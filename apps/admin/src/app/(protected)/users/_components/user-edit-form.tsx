'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type {
  IAdminUserDetail,
  IApiError,
  IRoleWithPermissions,
} from '@pkg/types'
import { Input, MultiSelect, Switch, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { usePermissions } from '@/hooks/use-permissions'

import { UserDetailSkeleton } from './user-detail-skeleton'

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
})

type IFormData = z.infer<typeof schema>

export type IUserEditFormRef = {
  submit: () => void
}

type IUserEditFormProps = {
  userId: string
  onLoad?: (info: {
    title: string
    email: string
    deletedAt: string | null
  }) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  footer?: React.ReactNode
}

export const UserEditForm = forwardRef<IUserEditFormRef, IUserEditFormProps>(
  ({ userId, onLoad, onLoadingChange, onSaveSuccess, footer }, ref) => {
    const { can } = usePermissions()

    const canUpdate = can('users:update')

    const [user, setUser] = useState<IAdminUserDetail | null>(null)
    const [allRoles, setAllRoles] = useState<IRoleWithPermissions[]>([])
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(true)

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<IFormData>({ resolver: zodResolver(schema) })

    useImperativeHandle(ref, () => ({
      submit: handleSubmit(onSubmit),
    }))

    const reload = () =>
      Promise.all([
        apiFetch<IAdminUserDetail>(`/api/admin/users/${userId}`),
        apiFetch<{ data: IRoleWithPermissions[] }>('/api/admin/roles'),
      ]).then(([u, rolesRes]) => {
        setUser(u)
        reset({ fullName: u.fullName ?? '' })
        setIsActive(u.isActive)
        setSelectedRoleIds(u.roles.map((r) => r.id))
        setAllRoles(rolesRes.data)
        onLoad?.({
          title: u.fullName ?? u.email,
          email: u.email,
          deletedAt: u.deletedAt,
        })
      })

    useEffect(() => {
      setLoading(true)
      onLoadingChange?.(true)
      reload()
        .catch((e: IApiError) => handleException(e))
        .finally(() => {
          setLoading(false)
          onLoadingChange?.(false)
        })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])

    const onSubmit = async (data: IFormData) => {
      if (!user) return
      try {
        const currentRoleIds = new Set(user.roles.map((r) => r.id))
        const nextRoleIds = new Set(selectedRoleIds)
        const toAdd = selectedRoleIds.filter((rid) => !currentRoleIds.has(rid))
        const toRemove = user.roles
          .filter((r) => !r.isSystem && !nextRoleIds.has(r.id))
          .map((r) => r.id)

        await Promise.all([
          apiFetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ fullName: data.fullName, isActive }),
          }),
          ...(toAdd.length > 0
            ? [
                apiFetch(`/api/admin/users/${userId}/roles`, {
                  method: 'POST',
                  body: JSON.stringify({ roleIds: toAdd }),
                }),
              ]
            : []),
          ...toRemove.map((rid) =>
            apiFetch(`/api/admin/users/${userId}/roles/${rid}`, {
              method: 'DELETE',
            })
          ),
        ])

        // Update local state directly — no refetch needed
        setUser((prev) =>
          prev
            ? {
                ...prev,
                fullName: data.fullName,
                isActive,
                roles: allRoles.filter((r) => selectedRoleIds.includes(r.id)),
              }
            : prev
        )
        toast.success('User updated successfully')
        onSaveSuccess?.()
      } catch (e) {
        handleException(e as IApiError)
      }
    }

    if (loading || !user) return <UserDetailSkeleton showFooter={!!footer} />

    const isSystemUser = user.roles.some((r) => r.isSystem)
    const isDeleted = !!user.deletedAt

    return (
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Row 1: Full name + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            id="fullName"
            label="Full Name"
            required
            placeholder="Jane Smith"
            disabled={!canUpdate || isSubmitting || isDeleted}
            errorMessage={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            value={user.email}
            readOnly
          />
        </div>

        {/* Row 2: Roles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MultiSelect
            id="roles"
            label="Assign Roles"
            placeholder="Select roles…"
            searchable
            options={allRoles.map((r) => ({ label: r.name, value: r.id }))}
            value={selectedRoleIds}
            onChange={setSelectedRoleIds}
            disabled={!canUpdate || isSubmitting || isSystemUser || isDeleted}
          />
        </div>

        {/* Row 3: Status */}
        <div className="flex items-center gap-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            color={isActive ? 'success' : 'destructive'}
            disabled={!canUpdate || isSubmitting || isSystemUser || isDeleted}
          />
          <label
            htmlFor="isActive"
            className="text-body-md cursor-pointer select-none"
          >
            {isActive ? 'Active' : 'Inactive'}
          </label>
        </div>

        {footer}
      </form>
    )
  }
)

UserEditForm.displayName = 'UserEditForm'
