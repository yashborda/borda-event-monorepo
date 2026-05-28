'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import { DeleteWebsiteUserDialog } from '../_components/delete-website-user-dialog'
import { RestoreWebsiteUserDialog } from '../_components/restore-website-user-dialog'
import type { IWebsiteUserEditFormRef } from '../_components/website-user-edit-form'
import { WebsiteUserEditForm } from '../_components/website-user-edit-form'

const WebsiteUserDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<IWebsiteUserEditFormRef>(null)
  const { can } = usePermissions()
  const [userInfo, setUserInfo] = useState<{
    title: string
    email: string
    deletedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)

  const canUpdate = can('website-users:update')
  const canDelete = can('website-users:delete')

  return (
    <PermissionGuard
      permission="website-users:read"
      redirectTo="/website-users"
    >
      <div className="flex flex-col gap-8">
        <PageHeader
          title={userInfo?.title ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Website Users', href: '/website-users' },
            { label: userInfo?.title ?? '' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <WebsiteUserEditForm
            ref={formRef}
            userId={id}
            onLoad={setUserInfo}
            onLoadingChange={setLoading}
            footer={
              canUpdate || canDelete ? (
                <div className="flex justify-end gap-2">
                  {canUpdate && !userInfo?.deletedAt && (
                    <Button
                      type="button"
                      onClick={() => formRef.current?.submit()}
                    >
                      Save Changes
                    </Button>
                  )}
                  {canDelete && !userInfo?.deletedAt && (
                    <Button
                      type="button"
                      variant="outline-destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete User
                    </Button>
                  )}
                  {canDelete && userInfo?.deletedAt && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRestoreOpen(true)}
                    >
                      Restore User
                    </Button>
                  )}
                </div>
              ) : null
            }
          />
        </div>

        <DeleteWebsiteUserDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          userId={id}
          userName={userInfo?.title ?? ''}
          onSuccess={() => router.push('/website-users')}
        />

        <RestoreWebsiteUserDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          userId={id}
          userName={userInfo?.title ?? ''}
          onSuccess={() => router.push('/website-users')}
        />
      </div>
    </PermissionGuard>
  )
}

export default WebsiteUserDetailPage
