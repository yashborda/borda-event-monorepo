'use client'

import { Dialog } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import type { IUserCreateFormRef } from '../../../users/_components/user-create-form'
import { UserCreateForm } from '../../../users/_components/user-create-form'

const NewUserModalPage = () => {
  const router = useRouter()
  const formRef = useRef<IUserCreateFormRef>(null)

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title="New User"
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
      <UserCreateForm
        ref={formRef}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('users:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default NewUserModalPage
