'use client'

import { Dialog } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef, useState } from 'react'

import type { IBlogAuthorCreateFormRef } from '../../../blog-authors/_components/blog-author-create-form'
import { BlogAuthorCreateForm } from '../../../blog-authors/_components/blog-author-create-form'

const NewBlogAuthorModalPage = () => {
  const router = useRouter()
  const formRef = useRef<IBlogAuthorCreateFormRef>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title="New Blog Author"
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
        },
        {
          label: 'Create Author',
          onClick: () => formRef.current?.submit(),
          disabled: isSubmitting,
        },
      ]}
    >
      <BlogAuthorCreateForm
        ref={formRef}
        onSubmittingChange={setIsSubmitting}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('blog-authors:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default NewBlogAuthorModalPage
