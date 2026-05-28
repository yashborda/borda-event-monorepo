'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef, useState } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IBlogAuthorCreateFormRef } from '../_components/blog-author-create-form'
import { BlogAuthorCreateForm } from '../_components/blog-author-create-form'

const NewBlogAuthorPage = () => {
  const router = useRouter()
  const formRef = useRef<IBlogAuthorCreateFormRef>(null)
  const [saving, setSaving] = useState(false)

  return (
    <PermissionGuard
      permission="blog-authors:create"
      redirectTo="/blog-authors"
    >
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Blog Author"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blog Authors', href: '/blog-authors' },
            { label: 'New Blog Author' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <BlogAuthorCreateForm
            ref={formRef}
            onSaveSuccess={() => router.push('/blog-authors')}
            onSubmittingChange={setSaving}
            footer={
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => formRef.current?.submit()}
                >
                  Create Author
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewBlogAuthorPage
