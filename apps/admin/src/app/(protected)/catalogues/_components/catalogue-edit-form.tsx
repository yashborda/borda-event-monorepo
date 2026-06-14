'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError, ICatalogueDetail } from '@pkg/types'
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
  title: z.string().min(1, 'Title is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(slugRegex, 'Lowercase letters, numbers, hyphens only'),
  description: z.string().optional(),
  isPublic: z.enum(['public', 'private']),
  coverImage: mediaFileSchema.nullable().optional(),
})

type IFormData = z.infer<typeof schema>

export type ICatalogueEditFormRef = { submit: () => void }

type ICatalogueEditFormProps = {
  catalogueId: string
  onLoad?: (data: ICatalogueDetail) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

export const CatalogueEditForm = forwardRef<
  ICatalogueEditFormRef,
  ICatalogueEditFormProps
>(
  (
    {
      catalogueId,
      onLoad,
      onLoadingChange,
      onSaveSuccess,
      onSubmittingChange,
      footer,
    },
    ref
  ) => {
    const { can } = usePermissions()
    const canUpdate = can('catalogues:update')
    const { slug, setSlug } = useSlug()
    const coverRef = useRef<ImageUploadHandle>(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isDeleted, setIsDeleted] = useState(false)

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
      defaultValues: { isPublic: 'private' },
    })

    const watchedCover = useWatch({ control, name: 'coverImage' })
    const watchedPublic = useWatch({ control, name: 'isPublic' })

    useEffect(() => {
      setValue('slug', slug, { shouldValidate: false })
    }, [slug, setValue])

    useEffect(() => {
      setIsLoading(true)
      onLoadingChange?.(true)
      apiFetch<ICatalogueDetail>(`/api/admin/catalogues/${catalogueId}`)
        .then((data) => {
          setSlug(data.slug)
          reset({
            title: data.title,
            slug: data.slug,
            description: data.description ?? '',
            isPublic: data.isPublic ? 'public' : 'private',
            coverImage: data.coverImage ?? null,
          })
          setIsDeleted(!!data.deletedAt)
          onLoad?.(data)
        })
        .catch((e: IApiError) => handleException(e))
        .finally(() => {
          setIsLoading(false)
          onLoadingChange?.(false)
        })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catalogueId])

    const handleFormSubmit = async () => {
      if (!(await trigger())) return
      onSubmittingChange?.(true)
      try {
        const cover = await coverRef.current!.upload()
        if (cover === undefined) return
        await handleSubmit(async (data) => {
          try {
            await apiFetch(`/api/admin/catalogues/${catalogueId}`, {
              method: 'PATCH',
              body: JSON.stringify({
                title: data.title,
                slug: data.slug,
                description: data.description || null,
                coverImageId: cover?.id ?? null,
                isPublic: data.isPublic === 'public',
              }),
            })
            toast.success('Catalogue updated successfully')
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
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )
    }

    const disabled = !canUpdate || isDeleted

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
          <Input
            id="title"
            label="Title"
            required
            disabled={disabled}
            errorMessage={errors.title?.message}
            {...register('title')}
          />
          <Input
            id="slug"
            label="Slug"
            required
            disabled={disabled}
            errorMessage={errors.slug?.message}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <Select
            id="isPublic"
            label="Visibility"
            options={[
              { label: 'Public', value: 'public' },
              { label: 'Private', value: 'private' },
            ]}
            value={watchedPublic}
            onChange={(v) =>
              setValue('isPublic', (v ?? 'private') as 'public' | 'private', {
                shouldValidate: true,
              })
            }
            disabled={disabled}
          />
        </div>

        <Textarea
          id="description"
          label="Description"
          disabled={disabled}
          errorMessage={errors.description?.message}
          {...register('description')}
        />

        <ImageUpload
          ref={coverRef}
          deferred
          folder="general"
          id="coverImage"
          label="Cover Image"
          value={watchedCover ?? null}
          onChange={(media) =>
            setValue('coverImage', media, { shouldValidate: true })
          }
          disabled={disabled}
          errorMessage={errors.coverImage?.message}
        />

        {footer}
      </form>
    )
  }
)

CatalogueEditForm.displayName = 'CatalogueEditForm'
