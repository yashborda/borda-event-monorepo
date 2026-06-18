'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Input,
  Separator,
  toast,
} from '@pkg/ui'
import {
  IconAlertCircle,
  IconCircleCheck,
  IconKey,
  IconLoader2,
  IconUpload,
} from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Link from 'next/link'

import { useRef, useState } from 'react'

import { apiFetch } from '@/lib/api-client'

import { useAuth } from '@/context/auth-context'

import { PageHeader } from '../_components/page-header'

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
})
type IFormData = z.infer<typeof schema>

const getInitials = (name: string | null, email: string) => {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: user?.fullName ?? '' },
  })

  const onSubmit = async (data: IFormData) => {
    try {
      await updateProfile({ fullName: data.fullName })
      toast.success('Profile updated successfully.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  const deleteStoredAvatar = (url: string) =>
    apiFetch('/api/admin/upload/image', {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    }).catch(() => {
      // best effort — don't block the user flow
    })

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setAvatarUploading(true)
    try {
      const oldUrl = user?.avatarUrl
      const { url } = await apiFetch<{ url: string }>(
        '/api/admin/upload/image?folder=profiles',
        { method: 'POST', body: formData }
      )
      await updateProfile({ avatarUrl: url })
      if (oldUrl) await deleteStoredAvatar(oldUrl)
      toast.success('Profile photo updated.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'IconUpload failed')
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const onRemoveAvatar = async () => {
    const oldUrl = user?.avatarUrl
    if (!oldUrl) return
    setAvatarUploading(true)
    try {
      await updateProfile({ avatarUrl: '' })
      await deleteStoredAvatar(oldUrl)
      toast.success('Profile photo removed.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Remove failed')
    } finally {
      setAvatarUploading(false)
    }
  }

  if (!user) return null

  const initials = getInitials(user.fullName, user.email)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Profile"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile' },
        ]}
        action={
          <Button variant="outline-muted" asChild>
            <Link href="/profile/change-password">
              <IconKey className="size-4" />
              Change Password
            </Link>
          </Button>
        }
      />

      <div className="border-border/40 shadow-shadow flex flex-col rounded-xl border shadow-lg">
        {/* Profile photo section */}
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <Avatar className="size-20 shrink-0">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-heading-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-heading-sm text-foreground">Profile Photo</p>
              <p className="text-body-sm text-muted-foreground">
                JPG, PNG, WebP or GIF · Max 150 MB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline-muted"
                size="sm"
                disabled={avatarUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUploading ? (
                  <IconLoader2 className="size-3.5 animate-spin" />
                ) : (
                  <IconUpload className="size-3.5" />
                )}
                {avatarUploading ? 'Uploading…' : 'IconUpload Photo'}
              </Button>
              {user.avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={avatarUploading}
                  onClick={onRemoveAvatar}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={onAvatarChange}
          />
        </div>

        <Separator />

        {/* Account fields */}
        <form
          className="flex flex-col gap-6 p-4 sm:p-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              id="fullName"
              label="Full Name"
              required
              placeholder="Jane Smith"
              disabled={isSubmitting}
              errorMessage={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              id="email"
              label="Email"
              value={user.email}
              readOnly
              hint={
                user.emailVerified ? 'Email verified' : 'Email not verified'
              }
              hintIcon={
                user.emailVerified ? (
                  <IconCircleCheck className="text-success size-3.5" />
                ) : (
                  <IconAlertCircle className="text-warning size-3.5" />
                )
              }
            />
          </div>

          {user.roles.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-body-md text-foreground font-medium">Roles</p>
              <div className="flex flex-wrap gap-1.5">
                {user.roles.map((r) => (
                  <Badge key={r} variant="secondary" className="capitalize">
                    {r.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
