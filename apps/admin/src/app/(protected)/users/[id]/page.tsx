'use client'

import { Badge, Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import { DeleteUserDialog } from '../_components/delete-user-dialog'
import { PermanentDeleteUserDialog } from '../_components/permanent-delete-user-dialog'
import { RestoreUserDialog } from '../_components/restore-user-dialog'
import { TransferOwnershipUserDialog } from '../_components/transfer-ownership-user-dialog'
import type { IUserEditFormRef } from '../_components/user-edit-form'
import { UserEditForm } from '../_components/user-edit-form'

const UserDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<IUserEditFormRef>(null)
  const { can } = usePermissions()
  const [userInfo, setUserInfo] = useState<{
    title: string
    email: string
    deletedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [transferOwnershipOpen, setTransferOwnershipOpen] = useState(false)
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false)

  const canUpdate = can('users:update')
  const canDelete = can('users:delete')

  const isDeleted = !!userInfo?.deletedAt

  return (
    <PermissionGuard permission="users:read" redirectTo="/users">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={userInfo?.title ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Users', href: '/users' },
            { label: userInfo?.title ?? '' },
          ]}
          badge={
            !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <UserEditForm
            ref={formRef}
            userId={id}
            onLoad={setUserInfo}
            onLoadingChange={setLoading}
            footer={
              canUpdate || canDelete ? (
                <div className="flex justify-end gap-2">
                  {canUpdate && !isDeleted && (
                    <Button
                      type="button"
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
                      Delete User
                    </Button>
                  )}
                  {canDelete && isDeleted && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRestoreOpen(true)}
                      >
                        Restore User
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setTransferOwnershipOpen(true)}
                      >
                        Transfer Ownership
                      </Button>
                      <Button
                        type="button"
                        variant="outline-destructive"
                        onClick={() => setPermanentDeleteOpen(true)}
                      >
                        Delete Permanently
                      </Button>
                    </>
                  )}
                </div>
              ) : null
            }
          />
        </div>

        <DeleteUserDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          userId={id}
          userName={userInfo?.title ?? ''}
          onSuccess={() => router.push('/users')}
        />

        <RestoreUserDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          userId={id}
          userName={userInfo?.title ?? ''}
          onSuccess={() => router.push('/users')}
        />

        <TransferOwnershipUserDialog
          open={transferOwnershipOpen}
          onOpenChange={setTransferOwnershipOpen}
          userId={id}
          userName={userInfo?.title ?? ''}
          userEmail={userInfo?.email ?? ''}
          onSuccess={() => setTransferOwnershipOpen(false)}
        />

        <PermanentDeleteUserDialog
          open={permanentDeleteOpen}
          onOpenChange={setPermanentDeleteOpen}
          userId={id}
          userName={userInfo?.title ?? ''}
          userEmail={userInfo?.email ?? ''}
          onSuccess={() => router.push('/users')}
        />
      </div>
    </PermissionGuard>
  )
}

export default UserDetailPage
