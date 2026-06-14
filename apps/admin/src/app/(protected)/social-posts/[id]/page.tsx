'use client'

import { Badge, Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import { DeleteSocialPostDialog } from '../_components/delete-social-post-dialog'
import type { ISocialPostEditFormRef } from '../_components/social-post-edit-form'
import { SocialPostEditForm } from '../_components/social-post-edit-form'

const SocialPostDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<ISocialPostEditFormRef>(null)
  const { can } = usePermissions()
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canUpdate = can('social-posts:update')
  const canDelete = can('social-posts:delete')

  return (
    <PermissionGuard permission="social-posts:read" redirectTo="/social-posts">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Edit Social Post"
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Social Posts', href: '/social-posts' },
            { label: 'Edit' },
          ]}
          badge={
            !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <SocialPostEditForm
            ref={formRef}
            postId={id}
            onLoad={(data) => setLabel(data.caption || data.postUrl)}
            onLoadingChange={setLoading}
            onSubmittingChange={setSaving}
            footer={
              canUpdate || canDelete ? (
                <div className="flex justify-end gap-2">
                  {canUpdate && (
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => formRef.current?.submit()}
                    >
                      Save Changes
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      type="button"
                      variant="outline-destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete Post
                    </Button>
                  )}
                </div>
              ) : null
            }
          />
        </div>

        <DeleteSocialPostDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          postId={id}
          postLabel={label}
          onSuccess={() => router.push('/social-posts')}
        />
      </div>
    </PermissionGuard>
  )
}

export default SocialPostDetailPage
