'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError } from '@pkg/types'
import { Input, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useImperativeHandle } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { RolePermissionsPanel } from './role-permissions-panel'
import { usePermissionSelection } from './use-permission-selection'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(
      /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
      'Only lowercase letters, numbers, hyphens, and underscores'
    ),
})

type IFormData = z.infer<typeof schema>

export type IRoleCreateFormRef = {
  submit: () => void
}

type IRoleCreateFormProps = {
  onSaveSuccess?: () => void
  footer?: React.ReactNode
}

export const RoleCreateForm = forwardRef<
  IRoleCreateFormRef,
  IRoleCreateFormProps
>(({ onSaveSuccess, footer }, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({ resolver: zodResolver(schema) })

  const { onChange: onSlugChange, ...slugRegister } = register('slug')

  const {
    grouped,
    filteredResources,
    selectedIds,
    selectedResource,
    setSelectedResource,
    search,
    setSearch,
    togglePerm,
    toggleAllForResource,
    loading,
  } = usePermissionSelection()

  useImperativeHandle(ref, () => ({
    submit: handleSubmit(onSubmit),
  }))

  const onSubmit = async (data: IFormData) => {
    try {
      const role = await apiFetch<{ id: string }>('/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (selectedIds.size > 0) {
        await apiFetch(`/api/admin/roles/${role.id}/permissions`, {
          method: 'POST',
          body: JSON.stringify({ permissionIds: [...selectedIds] }),
        })
      }
      toast.success('Role created successfully')
      onSaveSuccess?.()
    } catch (e) {
      handleException(e as IApiError)
    }
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          id="name"
          label="Name"
          required
          placeholder="Name"
          disabled={isSubmitting}
          errorMessage={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="slug"
          label="Slug"
          required
          placeholder="my-role"
          disabled={isSubmitting}
          errorMessage={errors.slug?.message}
          {...slugRegister}
          onChange={(e) => {
            e.target.value = e.target.value
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, '')
            onSlugChange(e)
          }}
        />
      </div>

      <RolePermissionsPanel
        grouped={grouped}
        filteredResources={filteredResources}
        selectedIds={selectedIds}
        selectedResource={selectedResource}
        search={search}
        onSearchChange={setSearch}
        onSelectResource={setSelectedResource}
        onTogglePerm={togglePerm}
        onToggleAllForResource={toggleAllForResource}
        loading={loading}
        disabled={isSubmitting}
      />

      {footer}
    </form>
  )
})

RoleCreateForm.displayName = 'RoleCreateForm'
