'use client'

import { Badge, Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IBlogAuthorEditFormRef } from '../_components/blog-author-edit-form'
import { BlogAuthorEditForm } from '../_components/blog-author-edit-form'
import { DeleteBlogAuthorDialog } from '../_components/delete-blog-author-dialog'
import { PermanentDeleteBlogAuthorDialog } from '../_components/permanent-delete-blog-author-dialog'
import { RestoreBlogAuthorDialog } from '../_components/restore-blog-author-dialog'

const BlogAuthorDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<IBlogAuthorEditFormRef>(null)
  const { can } = usePermissions()
  const [authorInfo, setAuthorInfo] = useState<{
    title: string
    deletedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false)

  const canUpdate = can('blog-authors:update')
  const canDelete = can('blog-authors:delete')

  const isDeleted = !!authorInfo?.deletedAt

  return (
    <PermissionGuard permission="blog-authors:read" redirectTo="/blog-authors">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={authorInfo?.title ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blog Authors', href: '/blog-authors' },
            { label: authorInfo?.title ?? '' },
          ]}
          badge={
            !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <BlogAuthorEditForm
            ref={formRef}
            authorId={id}
            onLoad={setAuthorInfo}
            onLoadingChange={setLoading}
            onSubmittingChange={setSaving}
            footer={
              canUpdate || canDelete ? (
                <div className="flex justify-end gap-2">
                  {canUpdate && !isDeleted && (
                    <Button
                      type="button"
                      disabled={saving}
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
                      Delete Author
                    </Button>
                  )}
                  {canDelete && isDeleted && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRestoreOpen(true)}
                      >
                        Restore Author
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

        <DeleteBlogAuthorDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          authorId={id}
          authorName={authorInfo?.title ?? ''}
          onSuccess={() => router.push('/blog-authors')}
        />

        <RestoreBlogAuthorDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          authorId={id}
          authorName={authorInfo?.title ?? ''}
          onSuccess={() => router.push('/blog-authors')}
        />

        <PermanentDeleteBlogAuthorDialog
          open={permanentDeleteOpen}
          onOpenChange={setPermanentDeleteOpen}
          authorId={id}
          authorName={authorInfo?.title ?? ''}
          onSuccess={() => router.push('/blog-authors')}
        />
      </div>
    </PermissionGuard>
  )
}

export default BlogAuthorDetailPage
