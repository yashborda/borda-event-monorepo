'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef, useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { IBlogCreateFormRef } from '../_components/blog-create-form'
import { BlogCreateForm } from '../_components/blog-create-form'

const NewBlogPage = () => {
  const router = useRouter()
  const { can } = usePermissions()
  const formRef = useRef<IBlogCreateFormRef>(null)
  const [saving, setSaving] = useState(false)

  const canCreate = can('blogs:create')

  return (
    <PermissionGuard permission="blogs:create" redirectTo="/blogs">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Blog Post"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blogs', href: '/blogs' },
            { label: 'New Blog Post' },
          ]}
          action={
            canCreate ? (
              <Button
                type="button"
                disabled={saving}
                onClick={() => formRef.current?.submit()}
              >
                Create Post
              </Button>
            ) : undefined
          }
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <BlogCreateForm
            ref={formRef}
            onSaveSuccess={() => router.push('/blogs')}
            onSubmittingChange={setSaving}
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewBlogPage
