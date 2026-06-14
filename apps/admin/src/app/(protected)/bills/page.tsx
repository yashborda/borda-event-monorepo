'use client'

import type { BillStatus, IBill } from '@pkg/types'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@pkg/ui'
import { IconDots, IconEye } from '@tabler/icons-react'

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
import { DeleteBillDialog } from './_components/delete-bill-dialog'
import { RestoreBillDialog } from './_components/restore-bill-dialog'

type IStatusFilter = 'all' | BillStatus

const STATUS_VARIANT: Record<
  BillStatus,
  'secondary' | 'warning' | 'success' | 'muted'
> = {
  draft: 'muted',
  confirmed: 'warning',
  completed: 'success',
  cancelled: 'secondary',
}

const BillsPage = () => {
  const { can } = usePermissions()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    billNo: string
  } | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<{
    id: string
    billNo: string
  } | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [statusFilter, setStatusFilter] = useState<IStatusFilter>('all')

  const extraParams = useMemo(() => {
    const p: Record<string, string> = {
      includeDeleted: includeDeleted ? 'true' : 'false',
    }
    if (statusFilter !== 'all') p.status = statusFilter
    return p
  }, [includeDeleted, statusFilter])

  const { data, loading, setSort, reload, tableProps } = useTable<IBill>({
    endpoint: '/api/admin/bills',
    defaultSort: { key: 'createdAt', dir: 'desc' },
    defaultPageSize: 10,
    extraParams,
  })

  const canDelete = can('bills:delete')

  const activeColumns: IColumn<IBill>[] = [
    {
      key: 'billNo',
      header: 'Bill No',
      sorting: true,
      minWidth: 130,
      cell: (b) => (
        <Link
          href={b.deletedAt ? `/bills/${b.id}?deleted=true` : `/bills/${b.id}`}
          className="text-body-md text-foreground font-medium hover:underline"
        >
          {b.billNo}
        </Link>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      minWidth: 180,
      cell: (b) => (
        <div>
          <span className="text-foreground">{b.customerName ?? '—'}</span>
          {b.customerPhone && (
            <p className="text-muted-foreground text-xs">{b.customerPhone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 120,
      cell: (b) => <Badge variant={STATUS_VARIANT[b.status]}>{b.status}</Badge>,
    },
    {
      key: 'eventDate',
      header: 'Event Date',
      sorting: true,
      minWidth: 160,
      cell: (b) => (
        <span className="text-muted-foreground">{appDate(b.eventDate)}</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      sorting: true,
      minWidth: 110,
      cell: (b) => (
        <span className="text-muted-foreground">₹{b.totalAmount}</span>
      ),
    },
    {
      key: 'creditBalance',
      header: 'Balance',
      minWidth: 110,
      cell: (b) => (
        <span className="text-muted-foreground">₹{b.creditBalance}</span>
      ),
    },
  ]

  const deletedColumns: IColumn<IBill>[] = [
    {
      key: 'deletedAt',
      header: 'Deleted At',
      sorting: true,
      minWidth: 180,
      cell: (b) => (
        <span className="text-muted-foreground">
          {b.deletedAt ? appDate(b.deletedAt) : ''}
        </span>
      ),
    },
    {
      key: 'deletedReason',
      header: 'Deletion Reason',
      minWidth: 300,
      cell: (b) => (
        <span className="text-muted-foreground">{b.deletedReason}</span>
      ),
    },
  ]

  const actionsColumn: IColumn<IBill> = {
    key: 'actions',
    header: 'Actions',
    sticky: 'right',
    className: 'text-right',
    minWidth: 100,
    cell: (b) => {
      const isDeleted = !!b.deletedAt
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
                isDeleted ? `/bills/${b.id}?deleted=true` : `/bills/${b.id}`
              }
            >
              <IconEye className="size-4" />
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
                      setRestoreTarget({ id: b.id, billNo: b.billNo })
                    }
                  >
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() =>
                      setDeleteTarget({ id: b.id, billNo: b.billNo })
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

  const columns: IColumn<IBill>[] = [
    ...activeColumns,
    ...(includeDeleted ? deletedColumns : []),
    actionsColumn,
  ]

  return (
    <PermissionGuard permission="bills:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Bills"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Bills' },
          ]}
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Select
              placeholder="All statuses"
              options={[
                { label: 'Draft', value: 'draft' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              value={statusFilter !== 'all' ? statusFilter : undefined}
              onChange={(v) => setStatusFilter((v as IStatusFilter) ?? 'all')}
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
                          key: v ? 'deletedAt' : 'createdAt',
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
            rowKey={(b) => b.id}
            loading={loading}
            emptyMessage={
              includeDeleted ? 'No deleted bills found.' : 'No bills found.'
            }
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteBillDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          billId={deleteTarget?.id ?? ''}
          billNo={deleteTarget?.billNo ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreBillDialog
          open={!!restoreTarget}
          onOpenChange={(o) => !o && setRestoreTarget(null)}
          billId={restoreTarget?.id ?? ''}
          billNo={restoreTarget?.billNo ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />
      </div>
    </PermissionGuard>
  )
}

export default BillsPage
