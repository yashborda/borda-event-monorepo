'use client'

import type { ICatalogue } from '@pkg/types'
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
import { DeleteCatalogueDialog } from './_components/delete-catalogue-dialog'
import { RestoreCatalogueDialog } from './_components/restore-catalogue-dialog'

type IVisibilityFilter = 'all' | 'public' | 'private'

const CataloguesPage = () => {
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
  const [visibility, setVisibility] = useState<IVisibilityFilter>('all')

  const extraParams = useMemo(() => {
    const p: Record<string, string> = {
      includeDeleted: includeDeleted ? 'true' : 'false',
    }
    if (visibility !== 'all')
      p.isPublic = visibility === 'public' ? 'true' : 'false'
    return p
  }, [includeDeleted, visibility])

  const { data, loading, search, setSearch, setSort, reload, tableProps } =
    useTable<ICatalogue>({
      endpoint: '/api/admin/catalogues',
      defaultSort: { key: 'updatedAt', dir: 'desc' },
      defaultPageSize: 10,
      extraParams,
    })

  const canCreate = can('catalogues:create')
  const canUpdate = can('catalogues:update')
  const canDelete = can('catalogues:delete')

  const activeColumns: IColumn<ICatalogue>[] = [
    {
      key: 'title',
      header: 'Title',
      sorting: true,
      minWidth: 220,
      cell: (c) => (
        <div>
          <Link
            href={
              c.deletedAt
                ? `/catalogues/${c.id}?deleted=true`
                : `/catalogues/${c.id}`
            }
            className="text-body-md text-foreground font-medium hover:underline"
          >
            {c.title}
          </Link>
          <p className="text-muted-foreground text-xs">{c.slug}</p>
        </div>
      ),
    },
    {
      key: 'isPublic',
      header: 'Visibility',
      minWidth: 110,
      cell: (c) => (
        <Badge variant={c.isPublic ? 'success' : 'muted'}>
          {c.isPublic ? 'Public' : 'Private'}
        </Badge>
      ),
    },
    {
      key: 'serviceCount',
      header: 'Services',
      minWidth: 90,
      cell: (c) => (
        <span className="text-muted-foreground">{c.serviceCount}</span>
      ),
    },
    {
      key: 'viewCount',
      header: 'Views',
      sorting: true,
      minWidth: 80,
      cell: (c) => <span className="text-muted-foreground">{c.viewCount}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      sorting: true,
      minWidth: 180,
      cell: (c) => (
        <span className="text-muted-foreground">{appDate(c.updatedAt)}</span>
      ),
    },
  ]

  const deletedColumns: IColumn<ICatalogue>[] = [
    {
      key: 'deletedAt',
      header: 'Deleted At',
      sorting: true,
      minWidth: 180,
      cell: (c) => (
        <span className="text-muted-foreground">
          {c.deletedAt ? appDate(c.deletedAt) : ''}
        </span>
      ),
    },
    {
      key: 'deletedReason',
      header: 'Deletion Reason',
      minWidth: 300,
      cell: (c) => (
        <span className="text-muted-foreground">{c.deletedReason}</span>
      ),
    },
  ]

  const actionsColumn: IColumn<ICatalogue> = {
    key: 'actions',
    header: 'Actions',
    sticky: 'right',
    className: 'text-right',
    minWidth: 100,
    cell: (c) => {
      const isDeleted = !!c.deletedAt
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
                  ? `/catalogues/${c.id}?deleted=true`
                  : `/catalogues/${c.id}`
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
                    onClick={() =>
                      setRestoreTarget({ id: c.id, name: c.title })
                    }
                  >
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteTarget({ id: c.id, name: c.title })}
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

  const columns: IColumn<ICatalogue>[] = [
    ...activeColumns,
    ...(includeDeleted ? deletedColumns : []),
    actionsColumn,
  ]

  return (
    <PermissionGuard permission="catalogues:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Catalogues"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Catalogues' },
          ]}
          action={
            canCreate && (
              <Button asChild>
                <Link href="/catalogues/new">
                  <IconPlus className="size-4" />
                  New Catalogue
                </Link>
              </Button>
            )
          }
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Input
              placeholder="Search catalogues…"
              icon={<IconSearch />}
              iconPosition="left"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="All"
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' },
              ]}
              value={visibility !== 'all' ? visibility : undefined}
              onChange={(v) => setVisibility((v as IVisibilityFilter) ?? 'all')}
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
            rowKey={(c) => c.id}
            loading={loading}
            emptyMessage={
              includeDeleted
                ? 'No deleted catalogues found.'
                : 'No catalogues found.'
            }
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteCatalogueDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          catalogueId={deleteTarget?.id ?? ''}
          catalogueName={deleteTarget?.name ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreCatalogueDialog
          open={!!restoreTarget}
          onOpenChange={(o) => !o && setRestoreTarget(null)}
          catalogueId={restoreTarget?.id ?? ''}
          catalogueName={restoreTarget?.name ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />
      </div>
    </PermissionGuard>
  )
}

export default CataloguesPage
