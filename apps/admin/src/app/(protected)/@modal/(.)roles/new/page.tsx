'use client'

import { Dialog } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { useRef } from 'react'

import type { IRoleCreateFormRef } from '../../../roles/_components/role-create-form'
import { RoleCreateForm } from '../../../roles/_components/role-create-form'

const NewRoleModalPage = () => {
  const router = useRouter()
  const formRef = useRef<IRoleCreateFormRef>(null)

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title="New Role"
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
        },
        {
          label: 'Create Role',
          onClick: () => formRef.current?.submit(),
        },
      ]}
    >
      <RoleCreateForm
        ref={formRef}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('roles:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default NewRoleModalPage
