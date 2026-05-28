'use client'

import { Dialog } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import type { IBlogCategoryCreateFormRef } from '../../../blog-categories/_components/blog-category-create-form'
import { BlogCategoryCreateForm } from '../../../blog-categories/_components/blog-category-create-form'

const NewBlogCategoryModalPage = () => {
  const router = useRouter()
  const formRef = useRef<IBlogCategoryCreateFormRef>(null)

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title="New Blog Category"
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
        },
        {
          label: 'Create Category',
          onClick: () => formRef.current?.submit(),
        },
      ]}
    >
      <BlogCategoryCreateForm
        ref={formRef}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('blog-categories:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default NewBlogCategoryModalPage
