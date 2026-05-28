'use client'

import { Dialog } from '@pkg/ui'

import { useRouter } from 'next/navigation'

import { use, useRef } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import type { IRoleEditFormRef } from '../../../roles/_components/role-edit-form'
import { RoleEditForm } from '../../../roles/_components/role-edit-form'

const RoleModalPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter()
  const { id } = use(params)
  const formRef = useRef<IRoleEditFormRef>(null)
  const { can } = usePermissions()
  const canUpdate = can('roles:update')

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title={canUpdate ? 'Edit Role' : 'View Role'}
      className="max-h-[90vh] max-w-5xl overflow-auto"
      actions={[
        {
          label: 'Cancel',
          variant: 'outline-muted',
          onClick: () => router.back(),
          className: 'ml-auto',
        },
        ...(canUpdate
          ? [
              {
                label: 'Save Changes',
                onClick: () => formRef.current?.save(),
              },
            ]
          : []),
      ]}
    >
      <RoleEditForm
        ref={formRef}
        roleId={id}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('roles:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default RoleModalPage
