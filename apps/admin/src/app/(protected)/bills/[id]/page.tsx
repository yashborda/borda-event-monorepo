'use client'

import type { BillStatus, IApiError, IBillDetail } from '@pkg/types'
import { Badge, Button, Select, Skeleton, toast } from '@pkg/ui'

import { use, useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { appDate } from '@/utils/date.helper'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import { DeleteBillDialog } from '../_components/delete-bill-dialog'
import { RestoreBillDialog } from '../_components/restore-bill-dialog'

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-muted-foreground text-xs tracking-wide uppercase">
      {label}
    </span>
    <span className="text-body-md text-foreground">{value || '—'}</span>
  </div>
)

const BillDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const { can } = usePermissions()
  const canUpdate = can('bills:update')
  const canDelete = can('bills:delete')

  const [bill, setBill] = useState<IBillDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<BillStatus>('draft')
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    setLoading(true)
    apiFetch<IBillDetail>(`/api/admin/bills/${id}`)
      .then((data) => {
        setBill(data)
        setStatus(data.status)
      })
      .catch((e: IApiError) => handleException(e))
      .finally(() => setLoading(false))
  }, [id, version])

  const updateStatus = async () => {
    setSaving(true)
    try {
      await apiFetch(`/api/admin/bills/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      toast.success('Bill status updated')
      setVersion((v) => v + 1)
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setSaving(false)
    }
  }

  const isDeleted = !!bill?.deletedAt

  return (
    <PermissionGuard permission="bills:read" redirectTo="/bills">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={bill?.billNo ?? 'Bill'}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Bills', href: '/bills' },
            { label: bill?.billNo ?? '' },
          ]}
          badge={
            bill ? <Badge variant="secondary">{bill.status}</Badge> : undefined
          }
          action={
            canDelete && bill ? (
              isDeleted ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRestoreOpen(true)}
                >
                  Restore Bill
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete Bill
                </Button>
              )
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          {loading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : bill ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Field
                  label="Customer"
                  value={
                    bill.customer.fullName
                      ? `${bill.customer.fullName}${bill.customer.phone ? ` (${bill.customer.phone})` : ''}`
                      : '—'
                  }
                />
                <Field label="Booking Date" value={appDate(bill.bookingDate)} />
                <Field label="Event Date" value={appDate(bill.eventDate)} />
                <Field
                  label="Destination"
                  value={bill.destinationAddr ?? '—'}
                />
                <Field label="Total Amount" value={`₹${bill.totalAmount}`} />
                <Field label="Advance" value={`₹${bill.advanceAmount}`} />
                <Field
                  label="Credit Balance"
                  value={`₹${bill.creditBalance}`}
                />
                <Field label="Created" value={appDate(bill.createdAt)} />
              </div>

              <div className="border-border/40 flex flex-col gap-3 border-t pt-6">
                <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
                  Line Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-muted-foreground border-border/40 border-b">
                      <tr>
                        <th className="py-2 pr-4 font-medium">Description</th>
                        <th className="py-2 pr-4 font-medium">Service</th>
                        <th className="py-2 pr-4 text-right font-medium">
                          Qty
                        </th>
                        <th className="py-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.items.map((it) => (
                        <tr
                          key={it.id}
                          className="border-border/20 border-b last:border-0"
                        >
                          <td className="text-foreground py-2 pr-4">
                            {it.description}
                          </td>
                          <td className="text-muted-foreground py-2 pr-4">
                            {it.serviceName ?? '—'}
                          </td>
                          <td className="text-muted-foreground py-2 pr-4 text-right">
                            {it.qty}
                          </td>
                          <td className="text-foreground py-2 text-right">
                            ₹{it.amount}
                          </td>
                        </tr>
                      ))}
                      {bill.items.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-muted-foreground py-4 text-center"
                          >
                            No line items.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {canUpdate && !isDeleted && (
                <div className="border-border/40 flex items-end gap-3 border-t pt-6">
                  <Select
                    id="status"
                    label="Update Status"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={(v) => setStatus((v ?? 'draft') as BillStatus)}
                    disabled={saving}
                    className="w-56"
                  />
                  <Button
                    type="button"
                    disabled={saving || status === bill.status}
                    onClick={updateStatus}
                  >
                    {saving ? 'Saving…' : 'Update Status'}
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </div>

        <DeleteBillDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          billId={id}
          billNo={bill?.billNo ?? ''}
          onSuccess={() => setVersion((v) => v + 1)}
        />

        <RestoreBillDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          billId={id}
          billNo={bill?.billNo ?? ''}
          onSuccess={() => setVersion((v) => v + 1)}
        />
      </div>
    </PermissionGuard>
  )
}

export default BillDetailPage
