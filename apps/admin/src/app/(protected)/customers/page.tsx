'use client'

import type { ICustomer } from '@pkg/types'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
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
import { DeleteCustomerDialog } from './_components/delete-customer-dialog'
import { RestoreCustomerDialog } from './_components/restore-customer-dialog'

const CustomersPage = () => {
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

  const extraParams = useMemo(
    () => ({ includeDeleted: includeDeleted ? 'true' : 'false' }),
    [includeDeleted]
  )

  const { data, loading, search, setSearch, setSort, reload, tableProps } =
    useTable<ICustomer>({
      endpoint: '/api/admin/customers',
      defaultSort: { key: 'updatedAt', dir: 'desc' },
      defaultPageSize: 10,
      extraParams,
    })

  const canCreate = can('customers:create')
  const canUpdate = can('customers:update')
  const canDelete = can('customers:delete')

  const activeColumns: IColumn<ICustomer>[] = [
    {
      key: 'fullName',
      header: 'Name',
      sorting: true,
      minWidth: 200,
      cell: (c) => (
        <div>
          <Link
            href={
              c.deletedAt
                ? `/customers/${c.id}?deleted=true`
                : `/customers/${c.id}`
            }
            className="text-body-md text-foreground font-medium hover:underline"
          >
            {c.fullName}
          </Link>
          <p className="text-muted-foreground text-xs">{c.phone}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      minWidth: 200,
      cell: (c) => (
        <span className="text-muted-foreground">{c.email ?? '—'}</span>
      ),
    },
    {
      key: 'billsCount',
      header: 'Bills',
      minWidth: 80,
      cell: (c) => (
        <span className="text-muted-foreground">{c.billsCount}</span>
      ),
    },
    {
      key: 'createdByName',
      header: 'Created By',
      minWidth: 140,
      cell: (c) => (
        <span className="text-muted-foreground">{c.createdByName}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sorting: true,
      minWidth: 180,
      cell: (c) => (
        <span className="text-muted-foreground">{appDate(c.createdAt)}</span>
      ),
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

  const deletedColumns: IColumn<ICustomer>[] = [
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

  const actionsColumn: IColumn<ICustomer> = {
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
                  ? `/customers/${c.id}?deleted=true`
                  : `/customers/${c.id}`
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
                      setRestoreTarget({ id: c.id, name: c.fullName })
                    }
                  >
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() =>
                      setDeleteTarget({ id: c.id, name: c.fullName })
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
  }

  const columns: IColumn<ICustomer>[] = [
    ...activeColumns,
    ...(includeDeleted ? deletedColumns : []),
    actionsColumn,
  ]

  return (
    <PermissionGuard permission="customers:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Customers"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Customers' },
          ]}
          action={
            canCreate && (
              <Button asChild>
                <Link href="/customers/new">
                  <IconPlus className="size-4" />
                  New Customer
                </Link>
              </Button>
            )
          }
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Input
              placeholder="Search by name or phone…"
              icon={<IconSearch />}
              iconPosition="left"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
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
                ? 'No deleted customers found.'
                : 'No customers found.'
            }
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteCustomerDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          customerId={deleteTarget?.id ?? ''}
          customerName={deleteTarget?.name ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreCustomerDialog
          open={!!restoreTarget}
          onOpenChange={(o) => !o && setRestoreTarget(null)}
          customerId={restoreTarget?.id ?? ''}
          customerName={restoreTarget?.name ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />
      </div>
    </PermissionGuard>
  )
}

export default CustomersPage
