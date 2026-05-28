'use client'

import type { IApiError, IWebsiteUser } from '@pkg/types'
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

import { useEffect, useMemo, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

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
import { DeleteWebsiteUserDialog } from './_components/delete-website-user-dialog'
import { PermanentDeleteWebsiteUserDialog } from './_components/permanent-delete-website-user-dialog'
import { RestoreWebsiteUserDialog } from './_components/restore-website-user-dialog'

const WebsiteUsersPage = () => {
  const { can } = usePermissions()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<
    'true' | 'false' | null
  >(null)
  const [isActiveFilter, setIsActiveFilter] = useState<'true' | 'false' | null>(
    null
  )

  const extraParams = useMemo(() => {
    const params: Record<string, string> = {
      includeDeleted: includeDeleted ? 'true' : 'false',
    }
    if (emailVerifiedFilter !== null) params.emailVerified = emailVerifiedFilter
    if (isActiveFilter !== null) params.isActive = isActiveFilter
    return params
  }, [includeDeleted, emailVerifiedFilter, isActiveFilter])

  const {
    data: users,
    loading,
    search,
    setSearch,
    setSort,
    reload,
    tableProps,
  } = useTable<IWebsiteUser>({
    endpoint: '/api/admin/website-users',
    defaultSort: { key: 'createdAt', dir: 'desc' },
    defaultPageSize: 10,
    extraParams,
  })

  useEffect(() => {
    const handler = () => reload()
    window.addEventListener('website-users:reload', handler)
    return () => window.removeEventListener('website-users:reload', handler)
  }, [reload])

  const canCreate = can('website-users:create')
  const canUpdate = can('website-users:update')
  const canDelete = can('website-users:delete')

  const toggleStatus = async (u: IWebsiteUser) => {
    setTogglingIds((prev) => new Set(prev).add(u.id))
    try {
      await apiFetch(`/api/admin/website-users/${u.id}`, {
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

  const columns: IColumn<IWebsiteUser>[] = [
    {
      key: 'fullName',
      header: 'IconUser',
      sorting: true,
      minWidth: 260,
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
                u.deletedAt
                  ? `/website-users/${u.id}?deleted=true`
                  : `/website-users/${u.id}`
              }
              className="text-body-md text-foreground font-medium hover:underline"
            >
              {u.fullName}
            </Link>
            <p className="text-muted-foreground text-xs">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'emailVerified',
      header: 'Verified',
      minWidth: 140,
      cell: (u) =>
        u.emailVerified ? (
          <Badge variant="success">Validated</Badge>
        ) : (
          <Badge variant="muted">Not Validated</Badge>
        ),
    },
    {
      key: 'isActive',
      header: 'Status',
      minWidth: 100,
      cell: (u) => {
        const isDeleted = !!u.deletedAt
        const disabled = !canUpdate || isDeleted || togglingIds.has(u.id)
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
      minWidth: 160,
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
        ] as IColumn<IWebsiteUser>[])
      : []),
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 100,
      cell: (u) => {
        const isDeleted = !!u.deletedAt
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
                  isDeleted
                    ? `/website-users/${u.id}?deleted=true`
                    : `/website-users/${u.id}`
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
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          setPermanentDeleteTarget({
                            id: u.id,
                            name: u.fullName ?? u.email,
                          })
                        }
                      >
                        Delete Permanently
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() =>
                        setDeleteTarget({
                          id: u.id,
                          name: u.fullName ?? u.email,
                        })
                      }
                    >
                      Delete
                    </DropdownMenuItem>
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
    <PermissionGuard permission="website-users:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Website Users"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Website Users' },
          ]}
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/website-users/new">
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
              placeholder="All verified"
              options={[
                { label: 'Validated', value: 'true' },
                { label: 'Not Validated', value: 'false' },
              ]}
              value={emailVerifiedFilter ?? undefined}
              onChange={(v) =>
                setEmailVerifiedFilter((v as 'true' | 'false') ?? null)
              }
              clearable
              className="w-40"
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

        <DeleteWebsiteUserDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          userId={deleteTarget?.id ?? ''}
          userName={deleteTarget?.name ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreWebsiteUserDialog
          open={!!restoreTarget}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          userId={restoreTarget?.id ?? ''}
          userName={restoreTarget?.name ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />

        <PermanentDeleteWebsiteUserDialog
          open={!!permanentDeleteTarget}
          onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
          userId={permanentDeleteTarget?.id ?? ''}
          userName={permanentDeleteTarget?.name ?? ''}
          onSuccess={() => {
            setPermanentDeleteTarget(null)
            reload()
          }}
        />
      </div>
    </PermissionGuard>
  )
}

export default WebsiteUsersPage
