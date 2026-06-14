'use client'

import { Badge, Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { ICatalogueEditFormRef } from '../_components/catalogue-edit-form'
import { CatalogueEditForm } from '../_components/catalogue-edit-form'
import { DeleteCatalogueDialog } from '../_components/delete-catalogue-dialog'
import { RestoreCatalogueDialog } from '../_components/restore-catalogue-dialog'

const CatalogueDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<ICatalogueEditFormRef>(null)
  const { can } = usePermissions()
  const [info, setInfo] = useState<{
    name: string
    deletedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)

  const canUpdate = can('catalogues:update')
  const canDelete = can('catalogues:delete')
  const isDeleted = !!info?.deletedAt

  return (
    <PermissionGuard permission="catalogues:read" redirectTo="/catalogues">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={info?.name ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Catalogues', href: '/catalogues' },
            { label: info?.name ?? '' },
          ]}
          badge={
            !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <CatalogueEditForm
            ref={formRef}
            catalogueId={id}
            onLoad={(data) =>
              setInfo({ name: data.title, deletedAt: data.deletedAt })
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
                      Delete Catalogue
                    </Button>
                  )}
                  {canDelete && isDeleted && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRestoreOpen(true)}
                    >
                      Restore Catalogue
                    </Button>
                  )}
                </div>
              ) : null
            }
          />
        </div>

        <DeleteCatalogueDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          catalogueId={id}
          catalogueName={info?.name ?? ''}
          onSuccess={() => router.push('/catalogues')}
        />

        <RestoreCatalogueDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          catalogueId={id}
          catalogueName={info?.name ?? ''}
          onSuccess={() => router.push('/catalogues')}
        />
      </div>
    </PermissionGuard>
  )
}

export default CatalogueDetailPage
