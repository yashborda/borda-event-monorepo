'use client'

import type { IApiError, IInquiryDetail, InquiryStatus } from '@pkg/types'
import { Badge, Button, Select, Skeleton, toast } from '@pkg/ui'

import { use, useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { appDate } from '@/utils/date.helper'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'

const STATUS_OPTIONS = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Booked', value: 'booked' },
  { label: 'Lost', value: 'lost' },
]

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-muted-foreground text-xs tracking-wide uppercase">
      {label}
    </span>
    <span className="text-body-md text-foreground">{value || '—'}</span>
  </div>
)

const InquiryDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const { can } = usePermissions()
  const canUpdate = can('inquiries:update')

  const [inquiry, setInquiry] = useState<IInquiryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<InquiryStatus>('new')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    apiFetch<IInquiryDetail>(`/api/admin/inquiries/${id}`)
      .then((data) => {
        setInquiry(data)
        setStatus(data.status)
      })
      .catch((e: IApiError) => handleException(e))
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async () => {
    setSaving(true)
    try {
      await apiFetch(`/api/admin/inquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      toast.success('Inquiry status updated')
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PermissionGuard permission="inquiries:read" redirectTo="/inquiries">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={inquiry?.name ?? 'Inquiry'}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Inquiries', href: '/inquiries' },
            { label: inquiry?.name ?? '' },
          ]}
          badge={
            inquiry ? (
              <Badge variant="secondary">{inquiry.status}</Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          {loading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : inquiry ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field label="Name" value={inquiry.name} />
                <Field label="Phone" value={inquiry.phone} />
                <Field
                  label="Event Date"
                  value={inquiry.eventDate ? appDate(inquiry.eventDate) : '—'}
                />
                <Field label="Received" value={appDate(inquiry.createdAt)} />
                <Field
                  label="Catalogue"
                  value={inquiry.catalogueTitle ?? '—'}
                />
                <Field
                  label="Linked Customer"
                  value={
                    inquiry.customerName
                      ? `${inquiry.customerName}${inquiry.customerPhone ? ` (${inquiry.customerPhone})` : ''}`
                      : '—'
                  }
                />
              </div>

              <Field label="Message" value={inquiry.message ?? '—'} />

              {canUpdate && (
                <div className="border-border/40 flex items-end gap-3 border-t pt-6">
                  <Select
                    id="status"
                    label="Update Status"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={(v) => setStatus((v ?? 'new') as InquiryStatus)}
                    disabled={saving}
                    className="w-56"
                  />
                  <Button
                    type="button"
                    disabled={saving || status === inquiry.status}
                    onClick={updateStatus}
                  >
                    {saving ? 'Saving…' : 'Update Status'}
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </PermissionGuard>
  )
}

export default InquiryDetailPage
