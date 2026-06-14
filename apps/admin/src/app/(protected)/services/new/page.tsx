'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef, useState } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IServiceCreateFormRef } from '../_components/service-create-form'
import { ServiceCreateForm } from '../_components/service-create-form'

const NewServicePage = () => {
  const router = useRouter()
  const formRef = useRef<IServiceCreateFormRef>(null)
  const [saving, setSaving] = useState(false)

  return (
    <PermissionGuard permission="services:create" redirectTo="/services">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Service"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Services', href: '/services' },
            { label: 'New Service' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <ServiceCreateForm
            ref={formRef}
            onSubmittingChange={setSaving}
            onSaveSuccess={() => router.push('/services')}
            footer={
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => formRef.current?.submit()}
                >
                  Create Service
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewServicePage
