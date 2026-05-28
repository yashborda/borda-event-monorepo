'use client'

import { Dialog } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import type { IBlogTagCreateFormRef } from '../../../blog-tags/_components/blog-tag-create-form'
import { BlogTagCreateForm } from '../../../blog-tags/_components/blog-tag-create-form'

const NewBlogTagModalPage = () => {
  const router = useRouter()
  const formRef = useRef<IBlogTagCreateFormRef>(null)

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title="New Blog Tag"
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
        },
        {
          label: 'Create Tag',
          onClick: () => formRef.current?.submit(),
        },
      ]}
    >
      <BlogTagCreateForm
        ref={formRef}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('blog-tags:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default NewBlogTagModalPage
