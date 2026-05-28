'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError, IWebsiteUser } from '@pkg/types'
import { Dialog, Input, Switch, toast } from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { usePermissions } from '@/hooks/use-permissions'

import { WebsiteUserDetailSkeleton } from './website-user-detail-skeleton'

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters')
    .pipe(z.email('Email is invalid')),
})

type IFormData = z.infer<typeof schema>

export type IWebsiteUserEditFormRef = {
  submit: () => void
}

type IWebsiteUserEditFormProps = {
  userId: string
  onLoad?: (info: {
    title: string
    email: string
    deletedAt: string | null
  }) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  footer?: React.ReactNode
}

export const WebsiteUserEditForm = forwardRef<
  IWebsiteUserEditFormRef,
  IWebsiteUserEditFormProps
>(({ userId, onLoad, onLoadingChange, onSaveSuccess, footer }, ref) => {
  const { can } = usePermissions()
  const canUpdate = can('website-users:update')

  const [user, setUser] = useState<IWebsiteUser | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [pendingData, setPendingData] = useState<IFormData | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({ resolver: zodResolver(schema) })

  useImperativeHandle(ref, () => ({
    submit: handleSubmit(onValidated),
  }))

  useEffect(() => {
    setLoading(true)
    onLoadingChange?.(true)
    apiFetch<IWebsiteUser>(`/api/admin/website-users/${userId}`)
      .then((u) => {
        setUser(u)
        reset({ fullName: u.fullName ?? '', email: u.email })
        setIsActive(u.isActive)
        onLoad?.({
          title: u.fullName ?? u.email,
          email: u.email,
          deletedAt: u.deletedAt,
        })
      })
      .catch((e: IApiError) => handleException(e))
      .finally(() => {
        setLoading(false)
        onLoadingChange?.(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Called after zod validation passes — show confirmation dialog
  const onValidated = (data: IFormData) => {
    setPendingData(data)
    setConfirmOpen(true)
  }

  // Called after user confirms
  const onConfirm = async () => {
    if (!pendingData || !user) return
    setConfirming(true)
    try {
      await apiFetch(`/api/admin/website-users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: pendingData.fullName || null,
          email: pendingData.email,
          isActive,
        }),
      })
      toast.success('User updated successfully')
      setConfirmOpen(false)
      setPendingData(null)
      onSaveSuccess?.()
    } catch (e) {
      handleException(e as IApiError)
    } finally {
      setConfirming(false)
    }
  }

  if (loading || !user) {
    return <WebsiteUserDetailSkeleton showFooter={!!footer} />
  }

  const isDeleted = !!user.deletedAt

  return (
    <>
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(onValidated)}
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="fullName"
            label="Full Name"
            required
            placeholder="Jane Smith"
            disabled={!canUpdate || isSubmitting || isDeleted}
            errorMessage={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            required
            placeholder="jane@example.com"
            disabled={!canUpdate || isSubmitting || isDeleted}
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            color={isActive ? 'success' : 'destructive'}
            disabled={!canUpdate || isSubmitting || isDeleted}
          />
          <label
            htmlFor="isActive"
            className="text-body-md cursor-pointer select-none"
          >
            {isActive ? 'Active' : 'Inactive'}
          </label>
        </div>

        {footer}
      </form>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!confirming) {
            setConfirmOpen(open)
            if (!open) setPendingData(null)
          }
        }}
        title="Confirm Changes"
        description="Are you sure you want to update this user's details?"
        actions={[
          {
            label: 'Cancel',
            variant: 'outline-muted',
            onClick: () => {
              setConfirmOpen(false)
              setPendingData(null)
            },
            disabled: confirming,
            className: 'ml-auto',
          },
          {
            label: confirming ? 'Saving…' : 'Save Changes',
            onClick: onConfirm,
            disabled: confirming,
          },
        ]}
      >
        <div />
      </Dialog>
    </>
  )
})

WebsiteUserEditForm.displayName = 'WebsiteUserEditForm'
