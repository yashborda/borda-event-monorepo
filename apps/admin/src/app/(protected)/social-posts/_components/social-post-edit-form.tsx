'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError, ISocialPost } from '@pkg/types'
import { Input, Select, Skeleton, Textarea, toast } from '@pkg/ui'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { usePermissions } from '@/hooks/use-permissions'

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

export type ISocialPostEditFormRef = { submit: () => void }

type ISocialPostEditFormProps = {
  postId: string
  onLoad?: (data: ISocialPost) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

export const SocialPostEditForm = forwardRef<
  ISocialPostEditFormRef,
  ISocialPostEditFormProps
>(
  (
    {
      postId,
      onLoad,
      onLoadingChange,
      onSaveSuccess,
      onSubmittingChange,
      footer,
    },
    ref
  ) => {
    const { can } = usePermissions()
    const canUpdate = can('social-posts:update')
    const thumbRef = useRef<ImageUploadHandle>(null)
    const [isLoading, setIsLoading] = useState(true)

    const {
      register,
      handleSubmit,
      control,
      setValue,
      reset,
      trigger,
      formState: { errors },
    } = useForm<IFormData>({
      resolver: zodResolver(schema),
      defaultValues: { platform: 'instagram', isFeatured: 'not', sortOrder: 0 },
    })

    const watchedThumb = useWatch({ control, name: 'thumbnail' })
    const watchedPlatform = useWatch({ control, name: 'platform' })
    const watchedFeatured = useWatch({ control, name: 'isFeatured' })

    useEffect(() => {
      setIsLoading(true)
      onLoadingChange?.(true)
      apiFetch<ISocialPost>(`/api/admin/social-posts/${postId}`)
        .then((data) => {
          reset({
            platform: data.platform,
            postUrl: data.postUrl,
            caption: data.caption ?? '',
            isFeatured: data.isFeatured ? 'featured' : 'not',
            sortOrder: data.sortOrder,
            thumbnail: data.thumbnail ?? null,
          })
          onLoad?.(data)
        })
        .catch((e: IApiError) => handleException(e))
        .finally(() => {
          setIsLoading(false)
          onLoadingChange?.(false)
        })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId])

    const handleFormSubmit = async () => {
      if (!(await trigger())) return
      onSubmittingChange?.(true)
      try {
        const thumb = await thumbRef.current!.upload()
        if (thumb === undefined) return
        await handleSubmit(async (data) => {
          try {
            await apiFetch(`/api/admin/social-posts/${postId}`, {
              method: 'PATCH',
              body: JSON.stringify({
                platform: data.platform,
                postUrl: data.postUrl,
                thumbnailId: thumb?.id ?? null,
                caption: data.caption || null,
                isFeatured: data.isFeatured === 'featured',
                sortOrder: data.sortOrder,
              }),
            })
            toast.success('Social post updated successfully')
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

    if (isLoading) {
      return (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )
    }

    const disabled = !canUpdate

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
              setValue(
                'platform',
                (v ?? 'instagram') as IFormData['platform'],
                { shouldValidate: true }
              )
            }
            disabled={disabled}
          />
          <Input
            id="postUrl"
            label="Post URL"
            required
            disabled={disabled}
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
            disabled={disabled}
          />
          <Input
            id="sortOrder"
            label="Sort Order"
            type="number"
            disabled={disabled}
            errorMessage={errors.sortOrder?.message}
            {...register('sortOrder', { valueAsNumber: true })}
          />
        </div>

        <Textarea
          id="caption"
          label="Caption"
          disabled={disabled}
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
          disabled={disabled}
          errorMessage={errors.thumbnail?.message}
        />

        {footer}
      </form>
    )
  }
)

SocialPostEditForm.displayName = 'SocialPostEditForm'
