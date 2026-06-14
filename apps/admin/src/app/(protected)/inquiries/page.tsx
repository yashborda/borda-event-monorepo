'use client'

import type { IInquiry, InquiryStatus } from '@pkg/types'
import { Badge, Button, Select } from '@pkg/ui'
import { IconEye } from '@tabler/icons-react'

import Link from 'next/link'

import { useMemo, useState } from 'react'

import { appDate } from '@/utils/date.helper'

import { useTable } from '@/hooks/use-table'

import {
  DataTable,
  DataTableRoot,
  DataTableToolbar,
  type IColumn,
} from '../_components/data-table'
import { PageHeader } from '../_components/page-header'
import { PermissionGuard } from '../_components/permission-guard'

type IStatusFilter = 'all' | InquiryStatus

const STATUS_VARIANT: Record<
  InquiryStatus,
  'secondary' | 'warning' | 'success' | 'muted'
> = {
  new: 'warning',
  contacted: 'secondary',
  booked: 'success',
  lost: 'muted',
}

const InquiriesPage = () => {
  const [statusFilter, setStatusFilter] = useState<IStatusFilter>('all')

  const extraParams = useMemo(() => {
    const p: Record<string, string> = {}
    if (statusFilter !== 'all') p.status = statusFilter
    return p
  }, [statusFilter])

  const { data, loading, tableProps } = useTable<IInquiry>({
    endpoint: '/api/admin/inquiries',
    defaultSort: { key: 'createdAt', dir: 'desc' },
    defaultPageSize: 10,
    extraParams,
  })

  const columns: IColumn<IInquiry>[] = [
    {
      key: 'name',
      header: 'Name',
      minWidth: 180,
      cell: (i) => (
        <div>
          <Link
            href={`/inquiries/${i.id}`}
            className="text-body-md text-foreground font-medium hover:underline"
          >
            {i.name}
          </Link>
          <p className="text-muted-foreground text-xs">{i.phone}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 110,
      cell: (i) => <Badge variant={STATUS_VARIANT[i.status]}>{i.status}</Badge>,
    },
    {
      key: 'catalogueTitle',
      header: 'Catalogue',
      minWidth: 160,
      cell: (i) => (
        <span className="text-muted-foreground">{i.catalogueTitle ?? '—'}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      minWidth: 160,
      cell: (i) => (
        <span className="text-muted-foreground">{i.customerName ?? '—'}</span>
      ),
    },
    {
      key: 'eventDate',
      header: 'Event Date',
      minWidth: 160,
      cell: (i) => (
        <span className="text-muted-foreground">
          {i.eventDate ? appDate(i.eventDate) : '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Received',
      sorting: true,
      minWidth: 180,
      cell: (i) => (
        <span className="text-muted-foreground">{appDate(i.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 80,
      cell: (i) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            asChild
          >
            <Link href={`/inquiries/${i.id}`}>
              <IconEye className="size-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PermissionGuard permission="inquiries:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Inquiries"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Inquiries' },
          ]}
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Select
              placeholder="All statuses"
              options={[
                { label: 'New', value: 'new' },
                { label: 'Contacted', value: 'contacted' },
                { label: 'Booked', value: 'booked' },
                { label: 'Lost', value: 'lost' },
              ]}
              value={statusFilter !== 'all' ? statusFilter : undefined}
              onChange={(v) => setStatusFilter((v as IStatusFilter) ?? 'all')}
              clearable
              className="w-44"
            />
          </DataTableToolbar>
          <DataTable
            columns={columns}
            data={data}
            rowKey={(i) => i.id}
            loading={loading}
            emptyMessage="No inquiries found."
            {...tableProps}
          />
        </DataTableRoot>
      </div>
    </PermissionGuard>
  )
}

export default InquiriesPage
