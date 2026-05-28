'use client'

import { Dialog } from '@pkg/ui'

import { useRouter, useSearchParams } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import type { IBlogTagEditFormRef } from '../../../blog-tags/_components/blog-tag-edit-form'
import { BlogTagEditForm } from '../../../blog-tags/_components/blog-tag-edit-form'

const BlogTagModalPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const formRef = useRef<IBlogTagEditFormRef>(null)
  const { can } = usePermissions()
  const canUpdate = can('blog-tags:update')
  const [saving, setSaving] = useState(false)

  const isDeleted = searchParams.get('deleted') === 'true'
  const canSave = canUpdate && !isDeleted

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title={canSave ? 'Edit Blog Tag' : 'View Blog Tag'}
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
      <BlogTagEditForm
        ref={formRef}
        tagId={id}
        onSubmittingChange={setSaving}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('blog-tags:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default BlogTagModalPage
