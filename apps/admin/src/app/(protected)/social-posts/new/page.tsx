'use client'

import { Button } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef, useState } from 'react'

import { PageHeader } from '../../_components/page-header'
import { PermissionGuard } from '../../_components/permission-guard'
import type { ISocialPostCreateFormRef } from '../_components/social-post-create-form'
import { SocialPostCreateForm } from '../_components/social-post-create-form'

const NewSocialPostPage = () => {
  const router = useRouter()
  const formRef = useRef<ISocialPostCreateFormRef>(null)
  const [saving, setSaving] = useState(false)

  return (
    <PermissionGuard
      permission="social-posts:create"
      redirectTo="/social-posts"
    >
      <div className="flex flex-col gap-8">
        <PageHeader
          title="New Social Post"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Social Posts', href: '/social-posts' },
            { label: 'New Social Post' },
          ]}
        />

        <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
          <SocialPostCreateForm
            ref={formRef}
            onSubmittingChange={setSaving}
            onSaveSuccess={() => router.push('/social-posts')}
            footer={
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => formRef.current?.submit()}
                >
                  Create Post
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </PermissionGuard>
  )
}

export default NewSocialPostPage
