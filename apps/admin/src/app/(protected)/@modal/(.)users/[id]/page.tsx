'use client'

import { Dialog } from '@pkg/ui'

import { useRouter, useSearchParams } from 'next/navigation'

import { use, useRef } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import type { IUserEditFormRef } from '../../../users/_components/user-edit-form'
import { UserEditForm } from '../../../users/_components/user-edit-form'

const UserModalPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter()
  const { id } = use(params)
  const searchParams = useSearchParams()
  const formRef = useRef<IUserEditFormRef>(null)
  const { can } = usePermissions()
  const canUpdate = can('users:update')

  const isDeleted = searchParams.get('deleted') === 'true'
  const canSave = canUpdate && !isDeleted

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title={canSave ? 'Edit User' : 'View User'}
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
        },
        ...(canSave
          ? [
              {
                label: 'Save Changes',
                onClick: () => formRef.current?.submit(),
              },
            ]
          : []),
      ]}
    >
      <UserEditForm
        ref={formRef}
        userId={id}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('users:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default UserModalPage
