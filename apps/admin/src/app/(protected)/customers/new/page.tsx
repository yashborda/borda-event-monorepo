'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { ICustomerCreateFormRef } from '../_components/customer-create-form'
import { CustomerCreateForm } from '../_components/customer-create-form'

const NewCustomerPage = () => {
  const router = useRouter()
  const formRef = useRef<ICustomerCreateFormRef>(null)

  return (
    <PermissionGuard permission="customers:create" redirectTo="/customers">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Customer"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Customers', href: '/customers' },
            { label: 'New Customer' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <CustomerCreateForm
            ref={formRef}
            onSaveSuccess={() => router.push('/customers')}
            footer={
              <div className="flex justify-end">
                <Button type="button" onClick={() => formRef.current?.submit()}>
                  Create Customer
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewCustomerPage
