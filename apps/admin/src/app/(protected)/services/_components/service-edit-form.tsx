'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError, IServiceDetail } from '@pkg/types'
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
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(slugRegex, 'Lowercase letters, numbers, hyphens only'),
  description: z.string().optional(),
  isActive: z.enum(['active', 'inactive']),
  sortOrder: z.number(),
  coverImage: mediaFileSchema.nullable().optional(),
  bannerImage: mediaFileSchema.nullable().optional(),
})

type IFormData = z.infer<typeof schema>

export type IServiceEditFormRef = { submit: () => void }

type IServiceEditFormProps = {
  serviceId: string
  onLoad?: (data: IServiceDetail) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

export const ServiceEditForm = forwardRef<
  IServiceEditFormRef,
  IServiceEditFormProps
>(
  (
    {
      serviceId,
      onLoad,
      onLoadingChange,
      onSaveSuccess,
      onSubmittingChange,
      footer,
    },
    ref
  ) => {
    const { can } = usePermissions()
    const canUpdate = can('services:update')
    const { slug, setSlug } = useSlug()
    const coverRef = useRef<ImageUploadHandle>(null)
    const bannerRef = useRef<ImageUploadHandle>(null)

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
      defaultValues: { isActive: 'active', sortOrder: 0 },
    })

    const watchedCover = useWatch({ control, name: 'coverImage' })
    const watchedBanner = useWatch({ control, name: 'bannerImage' })
    const watchedActive = useWatch({ control, name: 'isActive' })

    useEffect(() => {
      setValue('slug', slug, { shouldValidate: false })
    }, [slug, setValue])

    useEffect(() => {
      setIsLoading(true)
      onLoadingChange?.(true)
      apiFetch<IServiceDetail>(`/api/admin/services/${serviceId}`)
        .then((data) => {
          setSlug(data.slug)
          reset({
            name: data.name,
            slug: data.slug,
            description: data.description ?? '',
            isActive: data.isActive ? 'active' : 'inactive',
            sortOrder: data.sortOrder,
            coverImage: data.coverImage ?? null,
            bannerImage: data.bannerImage ?? null,
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
    }, [serviceId])

    const handleFormSubmit = async () => {
      if (!(await trigger())) return
      onSubmittingChange?.(true)
      try {
        const cover = await coverRef.current!.upload()
        if (cover === undefined) return
        const banner = await bannerRef.current!.upload()
        if (banner === undefined) return
        await handleSubmit(async (data) => {
          try {
            await apiFetch(`/api/admin/services/${serviceId}`, {
              method: 'PATCH',
              body: JSON.stringify({
                name: data.name,
                slug: data.slug,
                description: data.description || null,
                coverImageId: cover?.id ?? null,
                bannerImageId: banner?.id ?? null,
                isActive: data.isActive === 'active',
                sortOrder: data.sortOrder,
              }),
            })
            toast.success('Service updated successfully')
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
            id="name"
            label="Name"
            required
            disabled={disabled}
            errorMessage={errors.name?.message}
            {...register('name')}
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
          <Input
            id="sortOrder"
            label="Sort Order"
            type="number"
            disabled={disabled}
            errorMessage={errors.sortOrder?.message}
            {...register('sortOrder', { valueAsNumber: true })}
          />
          <Select
            id="isActive"
            label="Status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            value={watchedActive}
            onChange={(v) =>
              setValue('isActive', (v ?? 'active') as 'active' | 'inactive', {
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

        <ImageUpload
          ref={bannerRef}
          deferred
          folder="general"
          id="bannerImage"
          label="Banner Image"
          value={watchedBanner ?? null}
          onChange={(media) =>
            setValue('bannerImage', media, { shouldValidate: true })
          }
          disabled={disabled}
          errorMessage={errors.bannerImage?.message}
        />

        {footer}
      </form>
    )
  }
)

ServiceEditForm.displayName = 'ServiceEditForm'
