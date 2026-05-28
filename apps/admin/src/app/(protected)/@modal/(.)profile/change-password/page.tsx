'use client'

import { Dialog } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import type { IChangePasswordFormRef } from '../../../profile/_components/change-password-form'
import { ChangePasswordForm } from '../../../profile/_components/change-password-form'

const ChangePasswordModalPage = () => {
  const router = useRouter()
  const formRef = useRef<IChangePasswordFormRef>(null)

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title="Change Password"
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
        },
        {
          label: 'Update Password',
          onClick: () => formRef.current?.submit(),
        },
      ]}
    >
      <ChangePasswordForm ref={formRef} onSaveSuccess={() => router.back()} />
    </Dialog>
  )
}

export default ChangePasswordModalPage
