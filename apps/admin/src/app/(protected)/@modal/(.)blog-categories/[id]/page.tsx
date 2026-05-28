'use client'

import { Dialog } from '@pkg/ui'

import { useRouter, useSearchParams } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import type { IBlogCategoryEditFormRef } from '../../../blog-categories/_components/blog-category-edit-form'
import { BlogCategoryEditForm } from '../../../blog-categories/_components/blog-category-edit-form'

const BlogCategoryModalPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const formRef = useRef<IBlogCategoryEditFormRef>(null)
  const { can } = usePermissions()
  const canUpdate = can('blog-categories:update')
  const [saving, setSaving] = useState(false)

  const isDeleted = searchParams.get('deleted') === 'true'
  const canSave = canUpdate && !isDeleted

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title={canSave ? 'Edit Blog Category' : 'View Blog Category'}
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
        },
        ...(canSave
          ? [
              {
                label: 'Save Changes',
                onClick: () => formRef.current?.submit(),
                disabled: saving,
              },
            ]
          : []),
      ]}
    >
      <BlogCategoryEditForm
        ref={formRef}
        categoryId={id}
        onSubmittingChange={setSaving}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('blog-categories:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default BlogCategoryModalPage
