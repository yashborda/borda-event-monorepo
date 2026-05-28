'use client'

import { Badge, Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IBlogTagEditFormRef } from '../_components/blog-tag-edit-form'
import { BlogTagEditForm } from '../_components/blog-tag-edit-form'
import { DeleteBlogTagDialog } from '../_components/delete-blog-tag-dialog'
import { PermanentDeleteBlogTagDialog } from '../_components/permanent-delete-blog-tag-dialog'
import { RestoreBlogTagDialog } from '../_components/restore-blog-tag-dialog'

const BlogTagDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<IBlogTagEditFormRef>(null)
  const { can } = usePermissions()
  const [tagInfo, setTagInfo] = useState<{
    name: string
    deletedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false)

  const canUpdate = can('blog-tags:update')
  const canDelete = can('blog-tags:delete')

  const isDeleted = !!tagInfo?.deletedAt

  return (
    <PermissionGuard permission="blog-tags:read" redirectTo="/blog-tags">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={tagInfo?.name ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blog Tags', href: '/blog-tags' },
            { label: tagInfo?.name ?? '' },
          ]}
          badge={
            !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <BlogTagEditForm
            ref={formRef}
            tagId={id}
            onLoad={(data) =>
              setTagInfo({ name: data.name, deletedAt: data.deletedAt })
            }
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
                      Delete Tag
                    </Button>
                  )}
                  {canDelete && isDeleted && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRestoreOpen(true)}
                      >
                        Restore Tag
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

        <DeleteBlogTagDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          tagId={id}
          tagName={tagInfo?.name ?? ''}
          onSuccess={() => router.push('/blog-tags')}
        />

        <RestoreBlogTagDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          tagId={id}
          tagName={tagInfo?.name ?? ''}
          onSuccess={() => router.push('/blog-tags')}
        />

        <PermanentDeleteBlogTagDialog
          open={permanentDeleteOpen}
          onOpenChange={setPermanentDeleteOpen}
          tagId={id}
          tagName={tagInfo?.name ?? ''}
          onSuccess={() => router.push('/blog-tags')}
        />
      </div>
    </PermissionGuard>
  )
}

export default BlogTagDetailPage
