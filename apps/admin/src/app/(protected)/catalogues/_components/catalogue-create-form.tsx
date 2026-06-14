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

export type ICatalogueCreateFormRef = { submit: () => void }

type ICatalogueCreateFormProps = {
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

export const CatalogueCreateForm = forwardRef<
  ICatalogueCreateFormRef,
  ICatalogueCreateFormProps
>(({ onSaveSuccess, onSubmittingChange, footer }, ref) => {
  const { slug, setSlug, onSourceChange } = useSlug()
  const coverRef = useRef<ImageUploadHandle>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<IFormData>({
    resolver: zodResolver(schema),
    defaultValues: { isPublic: 'private' },
  })

  const watchedCover = useWatch({ control, name: 'coverImage' })
  const watchedPublic = useWatch({ control, name: 'isPublic' })

  useEffect(() => {
    setValue('slug', slug, { shouldValidate: false })
  }, [slug, setValue])

  const handleFormSubmit = async () => {
    if (!(await trigger())) return
    onSubmittingChange?.(true)
    try {
      const cover = await coverRef.current!.upload()
      if (cover === undefined) return
      await handleSubmit(async (data) => {
        try {
          await apiFetch('/api/admin/catalogues', {
            method: 'POST',
            body: JSON.stringify({
              title: data.title,
              slug: data.slug,
              description: data.description || undefined,
              coverImageId: cover?.id ?? null,
              isPublic: data.isPublic === 'public',
            }),
          })
          toast.success('Catalogue created successfully')
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
        <Input
          id="title"
          label="Title"
          required
          placeholder="Wedding Showcase"
          disabled={isSubmitting}
          errorMessage={errors.title?.message}
          {...register('title', {
            onChange: (e) => onSourceChange(e.target.value),
          })}
        />
        <Input
          id="slug"
          label="Slug"
          required
          placeholder="wedding-showcase"
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>

      <Textarea
        id="description"
        label="Description"
        placeholder="A short description of this catalogue…"
        disabled={isSubmitting}
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
        disabled={isSubmitting}
        errorMessage={errors.coverImage?.message}
      />

      {footer}
    </form>
  )
})

CatalogueCreateForm.displayName = 'CatalogueCreateForm'
