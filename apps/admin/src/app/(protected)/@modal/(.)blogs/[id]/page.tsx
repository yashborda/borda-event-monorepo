'use client'

import { Dialog } from '@pkg/ui'

import { useRouter, useSearchParams } from 'next/navigation'

import { use, useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import type { IBlogEditFormRef } from '../../../blogs/_components/blog-edit-form'
import { BlogEditForm } from '../../../blogs/_components/blog-edit-form'

const BlogModalPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const formRef = useRef<IBlogEditFormRef>(null)
  const { can } = usePermissions()
  const canUpdate = can('blogs:update')
  const [saving, setSaving] = useState(false)

  const isDeleted = searchParams.get('deleted') === 'true'
  const canSave = canUpdate && !isDeleted

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title={canSave ? 'Edit Blog Post' : 'View Blog Post'}
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
      <BlogEditForm
        ref={formRef}
        blogId={id}
        isDeleted={isDeleted}
        onSubmittingChange={setSaving}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('blogs:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default BlogModalPage
