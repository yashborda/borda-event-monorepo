'use client'

import { Badge, Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IBlogCategoryEditFormRef } from '../_components/blog-category-edit-form'
import { BlogCategoryEditForm } from '../_components/blog-category-edit-form'
import { DeleteBlogCategoryDialog } from '../_components/delete-blog-category-dialog'

const BlogCategoryDetailPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<IBlogCategoryEditFormRef>(null)
  const { can } = usePermissions()
  const [categoryInfo, setCategoryInfo] = useState<{
    name: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const canUpdate = can('blog-categories:update')
  const canDelete = can('blog-categories:delete')

  return (
    <PermissionGuard
      permission="blog-categories:read"
      redirectTo="/blog-categories"
    >
      <div className="flex flex-col gap-8">
        <PageHeader
          title={categoryInfo?.name ?? ''}
          loading={loading}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blog Categories', href: '/blog-categories' },
            { label: categoryInfo?.name ?? '' },
          ]}
          badge={
            !canUpdate ? (
              <Badge variant="secondary">View only</Badge>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <BlogCategoryEditForm
            ref={formRef}
            categoryId={id}
            onLoad={(data) => setCategoryInfo({ name: data.categoryName })}
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
                      Delete Category
                    </Button>
                  )}
                </div>
              ) : null
            }
          />
        </div>

        <DeleteBlogCategoryDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          categoryId={id}
          categoryName={categoryInfo?.name ?? ''}
          onSuccess={() => router.push('/blog-categories')}
        />
      </div>
    </PermissionGuard>
  )
}

export default BlogCategoryDetailPage
