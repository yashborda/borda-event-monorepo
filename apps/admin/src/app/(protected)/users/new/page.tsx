'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IUserCreateFormRef } from '../_components/user-create-form'
import { UserCreateForm } from '../_components/user-create-form'

const NewUserPage = () => {
  const router = useRouter()
  const formRef = useRef<IUserCreateFormRef>(null)

  return (
    <PermissionGuard permission="users:create" redirectTo="/users">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New User"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Users', href: '/users' },
            { label: 'New User' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <UserCreateForm
            ref={formRef}
            onSaveSuccess={() => router.push('/users')}
            footer={
              <div className="flex justify-end">
                <Button onClick={() => formRef.current?.submit()}>
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

export default NewUserPage
