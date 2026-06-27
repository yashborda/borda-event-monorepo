'use client'

import { Badge, Button } from '@pkg/ui'
import { IconExternalLink } from '@tabler/icons-react'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { env } from '@/env'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import { DeleteServiceDialog } from '../_components/delete-service-dialog'
import { RestoreServiceDialog } from '../_components/restore-service-dialog'
import type { IServiceEditFormRef } from '../_components/service-edit-form'
import { ServiceEditForm } from '../_components/service-edit-form'
import { ServiceThemesPanel } from '../_components/service-themes-panel'

const ServiceDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<IServiceEditFormRef>(null)
  const { can } = usePermissions()
  const [info, setInfo] = useState<{
    name: string
    slug: string
    deletedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)

  const canUpdate = can('services:update')
  const canDelete = can('services:delete')
  const isDeleted = !!info?.deletedAt
  // Link to the live public service page on the website (a separate app).
  const websiteUrl =
    info?.slug && !isDeleted
      ? `${env.NEXT_PUBLIC_WEBSITE_URL}/services/${info.slug}`
      : null

  return (
    <PermissionGuard permission="services:read" redirectTo="/services">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={info?.name ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Services', href: '/services' },
            { label: info?.name ?? '' },
          ]}
          badge={
            !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : undefined
          }
          action={
            websiteUrl ? (
              <Button variant="outline" asChild>
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                  <IconExternalLink className="size-4" />
                  View on website
                </a>
              </Button>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <ServiceEditForm
            ref={formRef}
            serviceId={id}
            onLoad={(data) => {
              setInfo({
                name: data.name,
                slug: data.slug,
                deletedAt: data.deletedAt,
              })
            }}
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
                      Delete Service
                    </Button>
                  )}
                  {canDelete && isDeleted && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRestoreOpen(true)}
                    >
                      Restore Service
                    </Button>
                  )}
                </div>
              ) : null
            }
          />
        </div>

        {!isDeleted && (
          <div className="border-border/40 shadow-shadow rounded-xl border p-4 shadow-lg sm:p-6">
            <ServiceThemesPanel serviceId={id} disabled={!canUpdate} />
          </div>
        )}

        <DeleteServiceDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          serviceId={id}
          serviceName={info?.name ?? ''}
          onSuccess={() => router.push('/services')}
        />

        <RestoreServiceDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          serviceId={id}
          serviceName={info?.name ?? ''}
          onSuccess={() => router.push('/services')}
        />
      </div>
    </PermissionGuard>
  )
}

export default ServiceDetailPage
