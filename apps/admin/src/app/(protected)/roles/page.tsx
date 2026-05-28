'use client'

import type { IRoleWithPermissions } from '@pkg/types'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from '@pkg/ui'
import {
  IconDots,
  IconEye,
  IconPencil,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

import { appDate } from '@/utils/date.helper'

import { usePermissions } from '@/hooks/use-permissions'
import { useTable } from '@/hooks/use-table'

import {
  DataTable,
  DataTableRoot,
  DataTableToolbar,
  type IColumn,
} from '../_components/data-table'
import { PageHeader } from '../_components/page-header'
import { PermissionGuard } from '../_components/permission-guard'
import { DeleteRoleDialog } from './_components/delete-role-dialog'

const RolesPage = () => {
  const { can } = usePermissions()
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  const {
    data: roles,
    loading,
    search,
    setSearch,
    reload,
    tableProps,
  } = useTable<IRoleWithPermissions>({
    endpoint: '/api/admin/roles',
    defaultSort: { key: 'updatedAt', dir: 'desc' },
  })

  useEffect(() => {
    const handler = () => reload()
    window.addEventListener('roles:reload', handler)
    return () => window.removeEventListener('roles:reload', handler)
  }, [reload])

  const canCreate = can('roles:create')
  const canUpdate = can('roles:update')
  const canDelete = can('roles:delete')

  const columns: IColumn<IRoleWithPermissions>[] = [
    {
      key: 'name',
      header: 'Role',
      sorting: true,
      minWidth: 200,
      cell: (role) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/roles/${role.id}`}
            className="text-body-md text-foreground font-medium hover:underline"
          >
            {role.name}
          </Link>
          {role.isSystem && (
            <Badge variant="secondary" className="text-xs">
              system
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      sorting: true,
      minWidth: 160,
      cell: (role) =>
        role.slug ? (
          <Badge variant="muted" className="text-xs">
            {role.slug}
          </Badge>
        ) : null,
    },
    {
      key: 'permissions',
      header: 'Permissions',
      cell: (role) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {role.permissions.slice(0, 3).map((p) => (
            <Badge key={p.id} variant="outline-muted" className="text-xs">
              {p.label ?? p.slug}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <span className="text-muted-foreground text-body-sm">
              {role.permissions.length - 3} more
            </span>
          )}
          {role.permissions.length === 0 && (
            <span className="text-muted-foreground text-body-sm">
              No permissions
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sorting: true,
      minWidth: 180,
      cell: (role) => (
        <span className="text-muted-foreground">{appDate(role.createdAt)}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      sorting: true,
      minWidth: 180,
      cell: (role) => (
        <span className="text-muted-foreground">{appDate(role.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 80,
      cell: (role) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            onClick={() => router.push(`/roles/${role.id}`)}
          >
            {canUpdate ? (
              <IconPencil className="size-4" />
            ) : (
              <IconEye className="size-4" />
            )}
          </Button>
          {canDelete && !role.isSystem && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost-muted" size="sm" className="size-8 p-0">
                  <IconDots className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() =>
                    setDeleteTarget({ id: role.id, name: role.name })
                  }
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
    },
  ]

  return (
    <PermissionGuard permission="roles:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Roles"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Roles' },
          ]}
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/roles/new">
                  <IconPlus className="size-4" />
                  Add Role
                </Link>
              </Button>
            ) : undefined
          }
        />

        <DataTableRoot>
          <DataTableToolbar>
            <Input
              placeholder="IconSearch roles…"
              icon={<IconSearch />}
              iconPosition="left"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </DataTableToolbar>
          <DataTable
            columns={columns}
            data={roles}
            rowKey={(r) => r.id}
            loading={loading}
            emptyMessage="No roles found."
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteRoleDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          roleId={deleteTarget?.id ?? ''}
          roleName={deleteTarget?.name ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />
      </div>
    </PermissionGuard>
  )
}

export default RolesPage
