'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError } from '@pkg/types'
import { Input, Select, Textarea, toast } from '@pkg/ui'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useImperativeHandle, useRef } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { ImageUpload, type ImageUploadHandle } from '@/components/image-upload'

const mediaFileSchema = z.object({
  id: z.string(),
  url: z.string(),
  folder: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
})

const schema = z.object({
  platform: z.enum(['instagram', 'facebook', 'youtube']),
  postUrl: z.string().min(1, 'Post URL is required'),
  caption: z.string().optional(),
  isFeatured: z.enum(['featured', 'not']),
  sortOrder: z.number(),
  thumbnail: mediaFileSchema.nullable().optional(),
})

type IFormData = z.infer<typeof schema>

export type ISocialPostCreateFormRef = { submit: () => void }

type ISocialPostCreateFormProps = {
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

export const SocialPostCreateForm = forwardRef<
  ISocialPostCreateFormRef,
  ISocialPostCreateFormProps
>(({ onSaveSuccess, onSubmittingChange, footer }, ref) => {
  const thumbRef = useRef<ImageUploadHandle>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { platform: 'instagram', isFeatured: 'not', sortOrder: 0 },
  })

  const watchedThumb = useWatch({ control, name: 'thumbnail' })
  const watchedPlatform = useWatch({ control, name: 'platform' })
  const watchedFeatured = useWatch({ control, name: 'isFeatured' })

  const handleFormSubmit = async () => {
    if (!(await trigger())) return
    onSubmittingChange?.(true)
    try {
      const thumb = await thumbRef.current!.upload()
      if (thumb === undefined) return
      await handleSubmit(async (data) => {
        try {
          await apiFetch('/api/admin/social-posts', {
            method: 'POST',
            body: JSON.stringify({
              platform: data.platform,
              postUrl: data.postUrl,
              thumbnailId: thumb?.id ?? null,
              caption: data.caption || undefined,
              isFeatured: data.isFeatured === 'featured',
              sortOrder: data.sortOrder,
            }),
          })
          toast.success('Social post created successfully')
          onSaveSuccess?.()
        } catch (e) {
          handleException(e as IApiError)
        }
      })()
    } finally {
      onSubmittingChange?.(false)
    }
  }

  useImperativeHandle(ref, () => ({ submit: handleFormSubmit }))

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        void handleFormSubmit()
      }}
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="platform"
          label="Platform"
          options={[
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'YouTube', value: 'youtube' },
          ]}
          value={watchedPlatform}
          onChange={(v) =>
            setValue('platform', (v ?? 'instagram') as IFormData['platform'], {
              shouldValidate: true,
            })
          }
          disabled={isSubmitting}
        />
        <Input
          id="postUrl"
          label="Post URL"
          required
          placeholder="https://instagram.com/p/…"
          disabled={isSubmitting}
          errorMessage={errors.postUrl?.message}
          {...register('postUrl')}
        />
        <Select
          id="isFeatured"
          label="Featured"
          options={[
            { label: 'Featured', value: 'featured' },
            { label: 'Not featured', value: 'not' },
          ]}
          value={watchedFeatured}
          onChange={(v) =>
            setValue('isFeatured', (v ?? 'not') as 'featured' | 'not', {
              shouldValidate: true,
            })
          }
          disabled={isSubmitting}
        />
        <Input
          id="sortOrder"
          label="Sort Order"
          type="number"
          placeholder="0"
          disabled={isSubmitting}
          errorMessage={errors.sortOrder?.message}
          {...register('sortOrder', { valueAsNumber: true })}
        />
      </div>

      <Textarea
        id="caption"
        label="Caption"
        placeholder="Optional caption…"
        disabled={isSubmitting}
        errorMessage={errors.caption?.message}
        {...register('caption')}
      />

      <ImageUpload
        ref={thumbRef}
        deferred
        folder="general"
        id="thumbnail"
        label="Thumbnail"
        value={watchedThumb ?? null}
        onChange={(media) =>
          setValue('thumbnail', media, { shouldValidate: true })
        }
        disabled={isSubmitting}
        errorMessage={errors.thumbnail?.message}
      />

      {footer}
    </form>
  )
})

SocialPostCreateForm.displayName = 'SocialPostCreateForm'
