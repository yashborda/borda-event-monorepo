'use client'

import { Dialog } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef, useState } from 'react'

import type { IBlogCreateFormRef } from '../../../blogs/_components/blog-create-form'
import { BlogCreateForm } from '../../../blogs/_components/blog-create-form'

const NewBlogModalPage = () => {
  const router = useRouter()
  const formRef = useRef<IBlogCreateFormRef>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title="New Blog Post"
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
          disabled: isSubmitting,
        },
        {
          label: isSubmitting ? 'Creating…' : 'Create Post',
          onClick: () => formRef.current?.submit(),
          disabled: isSubmitting,
        },
      ]}
    >
      <BlogCreateForm
        ref={formRef}
        onSubmittingChange={setIsSubmitting}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('blogs:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default NewBlogModalPage
