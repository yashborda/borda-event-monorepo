'use client'

import { Button } from '@pkg/ui'

import { useRef } from 'react'

import { PageHeader } from '../../_components/page-header'
import type { IChangePasswordFormRef } from '../_components/change-password-form'
import { ChangePasswordForm } from '../_components/change-password-form'

const ChangePasswordPage = () => {
  const formRef = useRef<IChangePasswordFormRef>(null)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Change Password"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile', href: '/profile' },
          { label: 'Change Password' },
        ]}
      />

      <div className="border-border/40 shadow-shadow flex flex-col gap-6 rounded-xl border p-4 shadow-lg sm:p-6">
        <ChangePasswordForm
          ref={formRef}
          footer={
            <div className="flex justify-end">
              <Button type="submit" onClick={() => formRef.current?.submit()}>
                Update Password
              </Button>
            </div>
          }
        />
      </div>
    </div>
  )
}

export default ChangePasswordPage
