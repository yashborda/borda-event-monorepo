'use client'

import { Dialog } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import type { IWebsiteUserCreateFormRef } from '../../../website-users/_components/website-user-create-form'
import { WebsiteUserCreateForm } from '../../../website-users/_components/website-user-create-form'

const NewWebsiteUserModalPage = () => {
  const router = useRouter()
  const formRef = useRef<IWebsiteUserCreateFormRef>(null)

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title="New Website User"
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
        },
        {
          label: 'Create User',
          onClick: () => formRef.current?.submit(),
        },
      ]}
    >
      <WebsiteUserCreateForm
        ref={formRef}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('website-users:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default NewWebsiteUserModalPage
