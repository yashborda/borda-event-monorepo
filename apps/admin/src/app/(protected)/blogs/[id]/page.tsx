'use client'

import { Badge, Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IBlogEditFormRef } from '../_components/blog-edit-form'
import { BlogEditForm } from '../_components/blog-edit-form'
import { DeleteBlogDialog } from '../_components/delete-blog-dialog'
import { PermanentDeleteBlogDialog } from '../_components/permanent-delete-blog-dialog'
import { PublishBlogDialog } from '../_components/publish-blog-dialog'
import { RestoreBlogDialog } from '../_components/restore-blog-dialog'

const BlogDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<IBlogEditFormRef>(null)
  const { can } = usePermissions()

  const [blogInfo, setBlogInfo] = useState<{
    title: string
    status: string
    deletedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)

  const canUpdate = can('blogs:update')
  const canDelete = can('blogs:delete')
  const canPublish = can('blogs:publish')

  const isDeleted = !!blogInfo?.deletedAt
  const canPublishNow = canPublish && !isDeleted && blogInfo?.status === 'draft'

  return (
    <PermissionGuard permission="blogs:read" redirectTo="/blogs">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={blogInfo?.title ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blogs', href: '/blogs' },
            { label: blogInfo?.title ?? '' },
          ]}
          badge={
            isDeleted ? (
              <Badge variant="destructive">Deleted</Badge>
            ) : !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : blogInfo?.status ? (
              <Badge
                variant={blogInfo.status === 'published' ? 'success' : 'muted'}
              >
                {blogInfo.status.charAt(0).toUpperCase() +
                  blogInfo.status.slice(1)}
              </Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <BlogEditForm
            ref={formRef}
            blogId={id}
            isDeleted={isDeleted}
            onLoad={setBlogInfo}
            onLoadingChange={setLoading}
            onSubmittingChange={setSaving}
            footer={
              blogInfo && (canUpdate || canDelete || canPublishNow) ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {canUpdate && !isDeleted && (
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => formRef.current?.submit()}
                    >
                      Save Changes
                    </Button>
                  )}
                  {canPublishNow && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPublishOpen(true)}
                    >
                      Publish
                    </Button>
                  )}
                  {canDelete && !isDeleted && (
                    <Button
                      type="button"
                      variant="outline-destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete Post
                    </Button>
                  )}
                  {canDelete && isDeleted && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRestoreOpen(true)}
                      >
                        Restore Post
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

        <DeleteBlogDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          blogId={id}
          blogTitle={blogInfo?.title ?? ''}
          onSuccess={() => router.push('/blogs')}
        />

        <RestoreBlogDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          blogId={id}
          blogTitle={blogInfo?.title ?? ''}
          onSuccess={() => {
            setRestoreOpen(false)
            setBlogInfo((prev) => (prev ? { ...prev, deletedAt: null } : prev))
          }}
        />

        <PermanentDeleteBlogDialog
          open={permanentDeleteOpen}
          onOpenChange={setPermanentDeleteOpen}
          blogId={id}
          blogTitle={blogInfo?.title ?? ''}
          onSuccess={() => router.push('/blogs')}
        />

        <PublishBlogDialog
          open={publishOpen}
          onOpenChange={setPublishOpen}
          blogId={id}
          blogTitle={blogInfo?.title ?? ''}
          currentStatus={blogInfo?.status ?? ''}
          onSuccess={() => {
            setPublishOpen(false)
            setBlogInfo((prev) =>
              prev ? { ...prev, status: 'published' } : prev
            )
          }}
        />
      </div>
    </PermissionGuard>
  )
}

export default BlogDetailPage
