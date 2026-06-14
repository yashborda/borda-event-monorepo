'use client'

import { Badge, Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { ICustomerEditFormRef } from '../_components/customer-edit-form'
import { CustomerEditForm } from '../_components/customer-edit-form'
import { DeleteCustomerDialog } from '../_components/delete-customer-dialog'
import { RestoreCustomerDialog } from '../_components/restore-customer-dialog'

const CustomerDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<ICustomerEditFormRef>(null)
  const { can } = usePermissions()
  const [info, setInfo] = useState<{
    name: string
    deletedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)

  const canUpdate = can('customers:update')
  const canDelete = can('customers:delete')
  const isDeleted = !!info?.deletedAt

  return (
    <PermissionGuard permission="customers:read" redirectTo="/customers">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={info?.name ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Customers', href: '/customers' },
            { label: info?.name ?? '' },
          ]}
          badge={
            !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <CustomerEditForm
            ref={formRef}
            customerId={id}
            onLoad={(data) =>
              setInfo({ name: data.fullName, deletedAt: data.deletedAt })
            }
            onLoadingChange={setLoading}
            onSubmittingChange={setSaving}
            footer={
              canUpdate || canDelete ? (
                <div className="flex justify-end gap-2">
                  {canUpdate && !isDeleted && (
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => formRef.current?.submit()}
                    >
                      Save Changes
                    </Button>
                  )}
                  {canDelete && !isDeleted && (
                    <Button
                      type="button"
                      variant="outline-destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete Customer
                    </Button>
                  )}
                  {canDelete && isDeleted && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRestoreOpen(true)}
                    >
                      Restore Customer
                    </Button>
                  )}
                </div>
              ) : null
            }
          />
        </div>

        <DeleteCustomerDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          customerId={id}
          customerName={info?.name ?? ''}
          onSuccess={() => router.push('/customers')}
        />

        <RestoreCustomerDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          customerId={id}
          customerName={info?.name ?? ''}
          onSuccess={() => router.push('/customers')}
        />
      </div>
    </PermissionGuard>
  )
}

export default CustomerDetailPage
