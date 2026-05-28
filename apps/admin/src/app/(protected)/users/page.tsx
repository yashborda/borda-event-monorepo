'use client'

import type { IAdminUserDetail, IApiError, IRole } from '@pkg/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Select,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  toast,
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

import { useEffect, useMemo, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { appDate } from '@/utils/date.helper'

import { usePermissions } from '@/hooks/use-permissions'
import { useTable } from '@/hooks/use-table'

import { useAuth } from '@/context/auth-context'

import {
  DataTable,
  DataTableRoot,
  DataTableToolbar,
  type IColumn,
} from '../_components/data-table'
import { PageHeader } from '../_components/page-header'
import { PermissionGuard } from '../_components/permission-guard'
import { DeleteUserDialog } from './_components/delete-user-dialog'
import { PermanentDeleteUserDialog } from './_components/permanent-delete-user-dialog'
import { RestoreUserDialog } from './_components/restore-user-dialog'
import { TransferOwnershipUserDialog } from './_components/transfer-ownership-user-dialog'

const UsersPage = () => {
  const { user: currentUser } = useAuth()
  const { can } = usePermissions()
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [transferOwnershipTarget, setTransferOwnershipTarget] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{
    id: string
    name: string
    email: string
  } | null>(null)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const [roles, setRoles] = useState<IRole[]>([])
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string | null>(null)
  const [isActiveFilter, setIsActiveFilter] = useState<'true' | 'false' | null>(
    null
  )
  const [includeDeleted, setIncludeDeleted] = useState(false)

  useEffect(() => {
    apiFetch<{ data: IRole[] }>('/api/admin/roles').then((res) =>
      setRoles(res.data)
    )
  }, [])

  const extraParams = useMemo(() => {
    const params: Record<string, string> = {
      includeDeleted: includeDeleted ? 'true' : 'false',
    }
    if (selectedRoleSlug) params.roleSlug = selectedRoleSlug
    if (isActiveFilter !== null) params.isActive = isActiveFilter
    return params
  }, [selectedRoleSlug, isActiveFilter, includeDeleted])

  const {
    data: users,
    loading,
    search,
    setSearch,
    setSort,
    reload,
    tableProps,
  } = useTable<IAdminUserDetail>({
    endpoint: '/api/admin/users',
    defaultSort: { key: 'createdAt', dir: 'desc' },
    defaultPageSize: 10,
    extraParams,
  })

  useEffect(() => {
    const handler = () => reload()
    window.addEventListener('users:reload', handler)
    return () => window.removeEventListener('users:reload', handler)
  }, [reload])

  const canCreate = can('users:create')
  const canDelete = can('users:delete')
  const canUpdate = can('users:update')

  const toggleStatus = async (u: IAdminUserDetail) => {
    setTogglingIds((prev) => new Set(prev).add(u.id))
    try {
      await apiFetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !u.isActive }),
      })
      toast.success(
        `IconUser ${!u.isActive ? 'activated' : 'deactivated'} successfully`
      )
      reload()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(u.id)
        return next
      })
    }
  }

  const columns: IColumn<IAdminUserDetail>[] = [
    {
      key: 'name',
      header: 'IconUser',
      sorting: true,
      minWidth: 240,
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={u.avatarUrl ?? undefined}
              alt={u.fullName ?? u.email}
            />
            <AvatarFallback>
              {(u.fullName ?? u.email).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={
                u.deletedAt ? `/users/${u.id}?deleted=true` : `/users/${u.id}`
              }
              className="text-body-md text-foreground font-medium hover:underline"
            >
              {u.fullName ?? u.email}
            </Link>
            {u.fullName && (
              <p className="text-muted-foreground text-xs">{u.email}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      minWidth: 200,
      cell: (u) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {u.roles.length === 0 ? (
            <span className="text-muted-foreground text-body-sm">No roles</span>
          ) : (
            u.roles.map((r) => (
              <Badge key={r.id} variant="muted" className="text-xs">
                {r.name}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      minWidth: 120,
      cell: (u) => {
        const isDeleted = !!u.deletedAt
        const isSystem = u.roles.some((r) => r.isSystem)
        const isSelf = u.id === currentUser?.id
        const disabled =
          !canUpdate || isSystem || isSelf || isDeleted || togglingIds.has(u.id)
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={u.isActive}
              onCheckedChange={() => toggleStatus(u)}
              color={u.isActive ? 'success' : 'destructive'}
              disabled={disabled}
            />
          </div>
        )
      },
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      sorting: true,
      minWidth: 180,
      cell: (u) => (
        <span className="text-muted-foreground">
          {u.lastLoginAt ? appDate(u.lastLoginAt) : ''}
        </span>
      ),
    },
    {
      key: 'createdByName',
      header: 'Created By',
      minWidth: 140,
      cell: (u) => (
        <span className="text-muted-foreground">{u.createdByName}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sorting: true,
      minWidth: 180,
      cell: (u) => (
        <span className="text-muted-foreground">{appDate(u.createdAt)}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      sorting: true,
      minWidth: 180,
      cell: (u) => (
        <span className="text-muted-foreground">{appDate(u.updatedAt)}</span>
      ),
    },
    ...(includeDeleted
      ? ([
          {
            key: 'deletedAt',
            header: 'Deleted At',
            sorting: true,
            minWidth: 180,
            cell: (u) => (
              <span className="text-muted-foreground">
                {u.deletedAt ? appDate(u.deletedAt) : ''}
              </span>
            ),
          },
          {
            key: 'deletedByName',
            header: 'Deleted By',
            minWidth: 140,
            cell: (u) => (
              <span className="text-muted-foreground">{u.deletedByName}</span>
            ),
          },
          {
            key: 'deletedReason',
            header: 'Deletion Reason',
            minWidth: 400,
            cell: (u) => (
              <span className="text-muted-foreground">{u.deletedReason}</span>
            ),
          },
        ] as IColumn<IAdminUserDetail>[])
      : []),
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 80,
      cell: (u) => {
        const isDeleted = !!u.deletedAt
        const isSystem = u.roles.some((r) => r.isSystem)
        const isSelf = u.id === currentUser?.id
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost-muted"
              size="sm"
              className="size-8 p-0"
              asChild
            >
              <Link
                href={
                  isDeleted ? `/users/${u.id}?deleted=true` : `/users/${u.id}`
                }
              >
                {canUpdate && !isDeleted ? (
                  <IconPencil className="size-4" />
                ) : (
                  <IconEye className="size-4" />
                )}
              </Link>
            </Button>
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost-muted"
                    size="sm"
                    className="size-8 p-0"
                  >
                    <IconDots className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isDeleted ? (
                    <>
                      <DropdownMenuItem
                        onClick={() =>
                          setRestoreTarget({
                            id: u.id,
                            name: u.fullName ?? u.email,
                          })
                        }
                      >
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setTransferOwnershipTarget({
                            id: u.id,
                            name: u.fullName ?? u.email,
                            email: u.email,
                          })
                        }
                      >
                        Transfer Ownership
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          setPermanentDeleteTarget({
                            id: u.id,
                            name: u.fullName ?? u.email,
                            email: u.email,
                          })
                        }
                      >
                        Delete Permanently
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push(`/users/${u.id}`)}
                      >
                        Edit
                      </DropdownMenuItem>
                      {!isSystem && !isSelf && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            setDeleteTarget({
                              id: u.id,
                              name: u.fullName ?? u.email,
                              email: u.email,
                            })
                          }
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <PermissionGuard permission="users:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Users"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Users' },
          ]}
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/users/new">
                  <IconPlus className="size-4" />
                  New IconUser
                </Link>
              </Button>
            ) : undefined
          }
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Input
              placeholder="IconSearch users…"
              icon={<IconSearch />}
              iconPosition="left"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="All statuses"
              options={[
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ]}
              value={isActiveFilter ?? undefined}
              onChange={(v) =>
                setIsActiveFilter((v as 'true' | 'false') ?? null)
              }
              clearable
              className="w-40"
            />
            <Select
              placeholder="All roles"
              options={roles
                .filter((r) => r.slug !== null)
                .map((r) => ({ label: r.name, value: r.slug as string }))}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              value={selectedRoleSlug as any}
              onChange={setSelectedRoleSlug}
              clearable
              className="w-48"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-auto">
                    <Switch
                      checked={includeDeleted}
                      onCheckedChange={(v) => {
                        setIncludeDeleted(v)
                        setSort({
                          key: v ? 'deletedAt' : 'updatedAt',
                          dir: 'desc',
                        })
                      }}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Show Deleted</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DataTableToolbar>
          <DataTable
            columns={columns}
            data={users}
            rowKey={(u) => u.id}
            loading={loading}
            emptyMessage={
              includeDeleted ? 'No deleted users found.' : 'No users found.'
            }
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteUserDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          userId={deleteTarget?.id ?? ''}
          userName={deleteTarget?.name ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreUserDialog
          open={!!restoreTarget}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          userId={restoreTarget?.id ?? ''}
          userName={restoreTarget?.name ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />

        <TransferOwnershipUserDialog
          open={!!transferOwnershipTarget}
          onOpenChange={(open) => !open && setTransferOwnershipTarget(null)}
          userId={transferOwnershipTarget?.id ?? ''}
          userName={transferOwnershipTarget?.name ?? ''}
          userEmail={transferOwnershipTarget?.email ?? ''}
          onSuccess={() => {
            setTransferOwnershipTarget(null)
            reload()
          }}
        />

        <PermanentDeleteUserDialog
          open={!!permanentDeleteTarget}
          onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
          userId={permanentDeleteTarget?.id ?? ''}
          userName={permanentDeleteTarget?.name ?? ''}
          userEmail={permanentDeleteTarget?.email ?? ''}
          onSuccess={() => {
            setPermanentDeleteTarget(null)
            reload()
          }}
        />
      </div>
    </PermissionGuard>
  )
}

export default UsersPage
