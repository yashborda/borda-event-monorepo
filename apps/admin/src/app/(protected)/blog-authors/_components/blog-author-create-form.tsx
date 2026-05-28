'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError } from '@pkg/types'
import { Input, Select, Textarea, toast } from '@pkg/ui'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { useSlug } from '@/hooks/use-slug'

import { ImageUpload, type ImageUploadHandle } from '@/components/image-upload'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const mediaFileSchema = z.object({
  id: z.string(),
  url: z.string(),
  folder: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
})

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(
      slugRegex,
      'Slug must be lowercase letters, numbers, and hyphens only'
    ),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255)
    .pipe(z.email('Email is invalid')),
  avatar: mediaFileSchema.nullable().optional(),
  bio: z.string().optional(),
  designation: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine((v) => !v || v === '' || z.string().url().safeParse(v).success, {
      message: 'Must be a valid URL',
    }),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type IFormData = z.infer<typeof schema>

export type IBlogAuthorCreateFormRef = {
  submit: () => void
}

type IBlogAuthorCreateFormProps = {
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

export const BlogAuthorCreateForm = forwardRef<
  IBlogAuthorCreateFormRef,
  IBlogAuthorCreateFormProps
>(({ onSaveSuccess, onSubmittingChange, footer }, ref) => {
  const { slug, setSlug, onSourceChange } = useSlug()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'active',
    },
  })

  const watchedAvatar = useWatch({ control, name: 'avatar' })
  const avatarRef = useRef<ImageUploadHandle>(null)

  useEffect(() => {
    setValue('slug', slug, { shouldValidate: false })
  }, [slug, setValue])

  const handleFormSubmit = async () => {
    if (!(await trigger())) return
    onSubmittingChange?.(true)
    try {
      const avatar = await avatarRef.current!.upload()
      if (avatar === undefined) return
      await handleSubmit(async (data) => {
        try {
          await apiFetch('/api/admin/blog-authors', {
            method: 'POST',
            body: JSON.stringify({
              fullName: data.fullName,
              slug: data.slug,
              email: data.email,
              avatarId: avatar?.id ?? null,
              bio: data.bio || undefined,
              designation: data.designation || undefined,
              website: data.website || undefined,
              twitter: data.twitter || undefined,
              linkedin: data.linkedin || undefined,
              instagram: data.instagram || undefined,
              status: data.status,
            }),
          })
          toast.success('Blog author created successfully')
          onSaveSuccess?.()
        } catch (e) {
          handleException(e as IApiError)
        }
      })()
    } finally {
      onSubmittingChange?.(false)
    }
  }

  useImperativeHandle(ref, () => ({
    submit: handleFormSubmit,
  }))

  const watchedStatus = useWatch({ control, name: 'status' })

  return (
    <form
      className="flex flex-col gap-10"
      onSubmit={(e) => {
        e.preventDefault()
        void handleFormSubmit()
      }}
      noValidate
    >
      {/* Basic Info */}
      <div className="flex flex-col gap-4">
        <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
          Basic Info
        </h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="fullName"
              label="Full Name"
              required
              placeholder="Jane Smith"
              disabled={isSubmitting}
              errorMessage={errors.fullName?.message}
              {...register('fullName', {
                onChange: (e) => onSourceChange(e.target.value),
              })}
            />
            <Input
              id="slug"
              label="Slug"
              required
              placeholder="jane-smith"
              disabled={isSubmitting}
              errorMessage={errors.slug?.message}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="email"
              type="email"
              label="Email"
              required
              placeholder="jane@example.com"
              disabled={isSubmitting}
              errorMessage={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="designation"
              label="Designation"
              placeholder="Senior Writer"
              disabled={isSubmitting}
              errorMessage={errors.designation?.message}
              {...register('designation')}
            />
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex flex-col gap-4">
        <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
          Avatar
        </h3>
        <ImageUpload
          ref={avatarRef}
          deferred
          folder="profiles"
          id="avatar"
          label="Avatar"
          value={watchedAvatar ?? null}
          onChange={(media) =>
            setValue('avatar', media, { shouldValidate: true })
          }
          disabled={isSubmitting}
          errorMessage={errors.avatar?.message}
        />
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-4">
        <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
          Bio
        </h3>
        <Textarea
          id="bio"
          label="Bio"
          placeholder="A short bio about the author…"
          disabled={isSubmitting}
          errorMessage={errors.bio?.message}
          {...register('bio')}
        />
      </div>

      {/* Social Links */}
      <div className="flex flex-col gap-4">
        <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
          Social Links
        </h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="website"
              label="Website"
              placeholder="https://example.com"
              disabled={isSubmitting}
              errorMessage={errors.website?.message}
              {...register('website')}
            />
            <Input
              id="twitter"
              label="Twitter"
              placeholder="@handle"
              disabled={isSubmitting}
              errorMessage={errors.twitter?.message}
              {...register('twitter')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="linkedin"
              label="LinkedIn"
              placeholder="linkedin.com/in/handle"
              disabled={isSubmitting}
              errorMessage={errors.linkedin?.message}
              {...register('linkedin')}
            />
            <Input
              id="instagram"
              label="Instagram"
              placeholder="@handle"
              disabled={isSubmitting}
              errorMessage={errors.instagram?.message}
              {...register('instagram')}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-4">
        <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
          Status
        </h3>
        <Select
          id="status"
          label="Status"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          value={watchedStatus}
          onChange={(v) =>
            setValue('status', (v ?? 'active') as 'active' | 'inactive', {
              shouldValidate: true,
            })
          }
          disabled={isSubmitting}
          className="w-48"
        />
      </div>

      {footer}
    </form>
  )
})

BlogAuthorCreateForm.displayName = 'BlogAuthorCreateForm'
