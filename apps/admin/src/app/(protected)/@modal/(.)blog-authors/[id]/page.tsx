'use client'

import { Dialog } from '@pkg/ui'

import { useRouter, useSearchParams } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import type { IBlogAuthorEditFormRef } from '../../../blog-authors/_components/blog-author-edit-form'
import { BlogAuthorEditForm } from '../../../blog-authors/_components/blog-author-edit-form'

const BlogAuthorModalPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const formRef = useRef<IBlogAuthorEditFormRef>(null)
  const { can } = usePermissions()
  const canUpdate = can('blog-authors:update')
  const [saving, setSaving] = useState(false)

  const isDeleted = searchParams.get('deleted') === 'true'
  const canSave = canUpdate && !isDeleted

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title={canSave ? 'Edit Blog Author' : 'View Blog Author'}
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
      <BlogAuthorEditForm
        ref={formRef}
        authorId={id}
        onSubmittingChange={setSaving}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('blog-authors:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default BlogAuthorModalPage
