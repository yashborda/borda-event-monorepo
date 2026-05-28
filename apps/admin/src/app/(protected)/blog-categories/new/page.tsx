'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef, useState } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IBlogCategoryCreateFormRef } from '../_components/blog-category-create-form'
import { BlogCategoryCreateForm } from '../_components/blog-category-create-form'

const NewBlogCategoryPage = () => {
  const router = useRouter()
  const formRef = useRef<IBlogCategoryCreateFormRef>(null)
  const [saving, setSaving] = useState(false)

  return (
    <PermissionGuard
      permission="blog-categories:create"
      redirectTo="/blog-categories"
    >
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Blog Category"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blog Categories', href: '/blog-categories' },
            { label: 'New Blog Category' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <BlogCategoryCreateForm
            ref={formRef}
            onSaveSuccess={() => router.push('/blog-categories')}
            onSubmittingChange={setSaving}
            footer={
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => formRef.current?.submit()}
                >
                  Create Category
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewBlogCategoryPage
