'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IBlogTagCreateFormRef } from '../_components/blog-tag-create-form'
import { BlogTagCreateForm } from '../_components/blog-tag-create-form'

const NewBlogTagPage = () => {
  const router = useRouter()
  const formRef = useRef<IBlogTagCreateFormRef>(null)

  return (
    <PermissionGuard permission="blog-tags:create" redirectTo="/blog-tags">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Blog Tag"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blog Tags', href: '/blog-tags' },
            { label: 'New Blog Tag' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <BlogTagCreateForm
            ref={formRef}
            onSaveSuccess={() => router.push('/blog-tags')}
            footer={
              <div className="flex justify-end">
                <Button type="button" onClick={() => formRef.current?.submit()}>
                  Create Tag
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewBlogTagPage
