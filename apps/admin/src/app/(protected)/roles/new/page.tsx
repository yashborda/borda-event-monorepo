'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IRoleCreateFormRef } from '../_components/role-create-form'
import { RoleCreateForm } from '../_components/role-create-form'

const NewRolePage = () => {
  const router = useRouter()
  const formRef = useRef<IRoleCreateFormRef>(null)

  return (
    <PermissionGuard permission="roles:create" redirectTo="/roles">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Role"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Roles', href: '/roles' },
            { label: 'New Role' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <RoleCreateForm
            ref={formRef}
            onSaveSuccess={() => router.push('/roles')}
            footer={
              <div className="flex justify-end">
                <Button onClick={() => formRef.current?.submit()}>
                  Create Role
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewRolePage
