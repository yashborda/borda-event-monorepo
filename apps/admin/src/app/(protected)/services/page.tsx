'use client'

import type { IService } from '@pkg/types'
import {
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
} from '@pkg/ui'
import {
  IconDots,
  IconEye,
  IconPencil,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

import Link from 'next/link'

import { useMemo, useState } from 'react'

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
import { DeleteServiceDialog } from './_components/delete-service-dialog'
import { RestoreServiceDialog } from './_components/restore-service-dialog'

type IActiveFilter = 'all' | 'active' | 'inactive'

const ServicesPage = () => {
  const { can } = usePermissions()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<IActiveFilter>('all')

  const extraParams = useMemo(() => {
    const p: Record<string, string> = {
      includeDeleted: includeDeleted ? 'true' : 'false',
    }
    if (activeFilter !== 'all')
      p.isActive = activeFilter === 'active' ? 'true' : 'false'
    return p
  }, [includeDeleted, activeFilter])

  const { data, loading, search, setSearch, setSort, reload, tableProps } =
    useTable<IService>({
      endpoint: '/api/admin/services',
      defaultSort: { key: 'updatedAt', dir: 'desc' },
      defaultPageSize: 10,
      extraParams,
    })

  const canCreate = can('services:create')
  const canUpdate = can('services:update')
  const canDelete = can('services:delete')

  const activeColumns: IColumn<IService>[] = [
    {
      key: 'name',
      header: 'Name',
      sorting: true,
      minWidth: 200,
      cell: (s) => (
        <div>
          <Link
            href={
              s.deletedAt
                ? `/services/${s.id}?deleted=true`
                : `/services/${s.id}`
            }
            className="text-body-md text-foreground font-medium hover:underline"
          >
            {s.name}
          </Link>
          <p className="text-muted-foreground text-xs">{s.slug}</p>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      minWidth: 110,
      cell: (s) => (
        <Badge variant={s.isActive ? 'success' : 'muted'}>
          {s.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'basePrice',
      header: 'Base Price',
      sorting: true,
      minWidth: 110,
      cell: (s) => (
        <span className="text-muted-foreground">{s.basePrice ?? '—'}</span>
      ),
    },
    {
      key: 'mediaCount',
      header: 'Media',
      minWidth: 80,
      cell: (s) => (
        <span className="text-muted-foreground">{s.mediaCount}</span>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort',
      sorting: true,
      minWidth: 80,
      cell: (s) => <span className="text-muted-foreground">{s.sortOrder}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      sorting: true,
      minWidth: 180,
      cell: (s) => (
        <span className="text-muted-foreground">{appDate(s.updatedAt)}</span>
      ),
    },
  ]

  const deletedColumns: IColumn<IService>[] = [
    {
      key: 'deletedAt',
      header: 'Deleted At',
      sorting: true,
      minWidth: 180,
      cell: (s) => (
        <span className="text-muted-foreground">
          {s.deletedAt ? appDate(s.deletedAt) : ''}
        </span>
      ),
    },
    {
      key: 'deletedReason',
      header: 'Deletion Reason',
      minWidth: 300,
      cell: (s) => (
        <span className="text-muted-foreground">{s.deletedReason}</span>
      ),
    },
  ]

  const actionsColumn: IColumn<IService> = {
    key: 'actions',
    header: 'Actions',
    sticky: 'right',
    className: 'text-right',
    minWidth: 100,
    cell: (s) => {
      const isDeleted = !!s.deletedAt
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
                  ? `/services/${s.id}?deleted=true`
                  : `/services/${s.id}`
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
                <Button variant="ghost-muted" size="sm" className="size-8 p-0">
                  <IconDots className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isDeleted ? (
                  <DropdownMenuItem
                    onClick={() => setRestoreTarget({ id: s.id, name: s.name })}
                  >
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteTarget({ id: s.id, name: s.name })}
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
  }

  const columns: IColumn<IService>[] = [
    ...activeColumns,
    ...(includeDeleted ? deletedColumns : []),
    actionsColumn,
  ]

  return (
    <PermissionGuard permission="services:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Services"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Services' },
          ]}
          action={
            canCreate && (
              <Button asChild>
                <Link href="/services/new">
                  <IconPlus className="size-4" />
                  New Service
                </Link>
              </Button>
            )
          }
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Input
              placeholder="Search services…"
              icon={<IconSearch />}
              iconPosition="left"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="All statuses"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              value={activeFilter !== 'all' ? activeFilter : undefined}
              onChange={(v) => setActiveFilter((v as IActiveFilter) ?? 'all')}
              clearable
              className="w-44"
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
            data={data}
            rowKey={(s) => s.id}
            loading={loading}
            emptyMessage={
              includeDeleted
                ? 'No deleted services found.'
                : 'No services found.'
            }
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteServiceDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          serviceId={deleteTarget?.id ?? ''}
          serviceName={deleteTarget?.name ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreServiceDialog
          open={!!restoreTarget}
          onOpenChange={(o) => !o && setRestoreTarget(null)}
          serviceId={restoreTarget?.id ?? ''}
          serviceName={restoreTarget?.name ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />
      </div>
    </PermissionGuard>
  )
}

export default ServicesPage
