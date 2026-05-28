'use client'

import { Badge, Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import { DeleteRoleDialog } from '../_components/delete-role-dialog'
import type { IRoleEditFormRef } from '../_components/role-edit-form'
import { RoleEditForm } from '../_components/role-edit-form'

const RoleDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<IRoleEditFormRef>(null)
  const { can } = usePermissions()
  const [roleInfo, setRoleInfo] = useState<{
    title: string
    isSystem: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canUpdate = can('roles:update')
  const canDelete = can('roles:delete')

  return (
    <PermissionGuard permission="roles:read" redirectTo="/roles">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={roleInfo?.title ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Roles', href: '/roles' },
            { label: roleInfo?.title ?? '' },
          ]}
          badge={
            roleInfo?.isSystem ? (
              <Badge variant="secondary">System</Badge>
            ) : !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <RoleEditForm
            ref={formRef}
            roleId={id}
            onLoad={setRoleInfo}
            onLoadingChange={setLoading}
            footer={
              canUpdate || canDelete ? (
                <div className="flex justify-end gap-2">
                  {canUpdate && (
                    <Button
                      type="button"
                      onClick={() => formRef.current?.save()}
                    >
                      Save Changes
                    </Button>
                  )}
                  {canDelete && !roleInfo?.isSystem && (
                    <Button
                      type="button"
                      variant="outline-destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete Role
                    </Button>
                  )}
                </div>
              ) : null
            }
          />
        </div>

        <DeleteRoleDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          roleId={id}
          roleName={roleInfo?.title ?? ''}
          onSuccess={() => router.push('/roles')}
        />
      </div>
    </PermissionGuard>
  )
}

export default RoleDetailPage
