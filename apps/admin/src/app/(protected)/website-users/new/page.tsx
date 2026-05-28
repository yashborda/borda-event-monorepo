'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IWebsiteUserCreateFormRef } from '../_components/website-user-create-form'
import { WebsiteUserCreateForm } from '../_components/website-user-create-form'

const NewWebsiteUserPage = () => {
  const router = useRouter()
  const formRef = useRef<IWebsiteUserCreateFormRef>(null)

  return (
    <PermissionGuard
      permission="website-users:create"
      redirectTo="/website-users"
    >
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Website User"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Website Users', href: '/website-users' },
            { label: 'New Website User' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <WebsiteUserCreateForm
            ref={formRef}
            onSaveSuccess={() => router.push('/website-users')}
            footer={
              <div className="flex justify-end">
                <Button type="button" onClick={() => formRef.current?.submit()}>
                  Create User
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewWebsiteUserPage
