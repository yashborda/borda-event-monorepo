'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef, useState } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { ICatalogueCreateFormRef } from '../_components/catalogue-create-form'
import { CatalogueCreateForm } from '../_components/catalogue-create-form'

const NewCataloguePage = () => {
  const router = useRouter()
  const formRef = useRef<ICatalogueCreateFormRef>(null)
  const [saving, setSaving] = useState(false)

  return (
    <PermissionGuard permission="catalogues:create" redirectTo="/catalogues">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Catalogue"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Catalogues', href: '/catalogues' },
            { label: 'New Catalogue' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <CatalogueCreateForm
            ref={formRef}
            onSubmittingChange={setSaving}
            onSaveSuccess={() => router.push('/catalogues')}
            footer={
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => formRef.current?.submit()}
                >
                  Create Catalogue
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewCataloguePage
