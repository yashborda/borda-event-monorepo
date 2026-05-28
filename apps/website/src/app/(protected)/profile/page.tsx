'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Label,
} from '@pkg/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useState } from 'react'

import { useAuth } from '@/context/auth-context'

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
})
type IProfileData = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })
type IPasswordData = z.infer<typeof passwordSchema>

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const profileForm = useForm<IProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? '' },
  })

  const passwordForm = useForm<IPasswordData>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: IProfileData) => {
    setProfileError('')
    setProfileSuccess(false)
    try {
      await updateProfile({ fullName: data.fullName })
      setProfileSuccess(true)
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  const onPasswordSubmit = async (data: IPasswordData) => {
    setPasswordError('')
    setPasswordSuccess(false)
    try {
      await changePassword(data.currentPassword, data.newPassword)
      setPasswordSuccess(true)
      passwordForm.reset()
    } catch (e) {
      setPasswordError(
        e instanceof Error ? e.message : 'Password change failed'
      )
    }
  }

  if (!user) return null

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Heading as="h1">Profile</Heading>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...profileForm.register('fullName')} />
              {profileForm.formState.errors.fullName && (
                <p className="text-destructive text-xs">
                  {profileForm.formState.errors.fullName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Input value={user.email} readOnly className="bg-muted" />
                {user.emailVerified ? (
                  <Badge variant="secondary">Verified</Badge>
                ) : (
                  <Badge variant="outline">Unverified</Badge>
                )}
              </div>
            </div>
            {profileError && (
              <p className="text-destructive text-sm">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-success text-sm">Profile updated.</p>
            )}
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password — only for users with a password */}
      {user.emailVerified && (
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register('currentPassword')}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-destructive text-xs">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register('newPassword')}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-destructive text-xs">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  {...passwordForm.register('confirm')}
                />
                {passwordForm.formState.errors.confirm && (
                  <p className="text-destructive text-xs">
                    {passwordForm.formState.errors.confirm.message}
                  </p>
                )}
              </div>
              {passwordError && (
                <p className="text-destructive text-sm">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-success text-sm">Password updated.</p>
              )}
              <Button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
              >
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProfilePage
