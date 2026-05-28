'use client'

import { Dialog } from '@pkg/ui'

import { useRouter, useSearchParams } from 'next/navigation'

import { use, useRef } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import type { IWebsiteUserEditFormRef } from '../../../website-users/_components/website-user-edit-form'
import { WebsiteUserEditForm } from '../../../website-users/_components/website-user-edit-form'

const WebsiteUserModalPage = ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const router = useRouter()
  const { id } = use(params)
  const searchParams = useSearchParams()
  const formRef = useRef<IWebsiteUserEditFormRef>(null)
  const { can } = usePermissions()
  const canUpdate = can('website-users:update')

  const isDeleted = searchParams.get('deleted') === 'true'
  const canSave = canUpdate && !isDeleted

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && router.back()}
      title={canSave ? 'Edit Website User' : 'View Website User'}
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
      <WebsiteUserEditForm
        ref={formRef}
        userId={id}
        onSaveSuccess={() => {
          window.dispatchEvent(new CustomEvent('website-users:reload'))
          router.back()
        }}
      />
    </Dialog>
  )
}

export default WebsiteUserModalPage
