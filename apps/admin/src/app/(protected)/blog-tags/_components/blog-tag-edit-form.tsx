'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError, IBlogTag } from '@pkg/types'
import { Input, Select, Textarea, toast } from '@pkg/ui'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { usePermissions } from '@/hooks/use-permissions'
import { useSlug } from '@/hooks/use-slug'

import { BlogTagFormSkeleton } from './blog-tag-form-skeleton'

const slugRegex = /^[a-z0-9]+(?:[-][a-z0-9]+)*$/

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(slugRegex, 'Only lowercase letters, numbers, and hyphens allowed'),
  status: z.enum(['draft', 'published']),
  sortOrder: z.number(),
  excerpt: z
    .string()
    .max(500, 'Excerpt must be at most 500 characters')
    .optional(),
})

type IFormData = z.infer<typeof schema>

export type IBlogTagEditFormRef = {
  submit: () => void
}

type IBlogTagEditFormProps = {
  tagId: string
  onLoad?: (data: IBlogTag) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

export const BlogTagEditForm = forwardRef<
  IBlogTagEditFormRef,
  IBlogTagEditFormProps
>(
  (
    {
      tagId,
      onLoad,
      onLoadingChange,
      onSaveSuccess,
      onSubmittingChange,
      footer,
    },
    ref
  ) => {
    const { can } = usePermissions()
    const canUpdate = can('blog-tags:update')

    const [isLoading, setIsLoading] = useState(true)
    const [isDeleted, setIsDeleted] = useState(false)
    const slugHelper = useSlug()

    const {
      register,
      handleSubmit,
      control,
      setValue,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<IFormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        status: 'draft',
        sortOrder: 0,
      },
    })

    const name = useWatch({ control, name: 'name' })
    const watchedStatus = useWatch({ control, name: 'status' })

    useEffect(() => {
      slugHelper.onSourceChange(name ?? '')
    }, [name, slugHelper.onSourceChange])

    useEffect(() => {
      setValue('slug', slugHelper.slug)
    }, [slugHelper.slug, setValue])

    useEffect(() => {
      onSubmittingChange?.(isSubmitting)
    }, [isSubmitting, onSubmittingChange])

    useEffect(() => {
      setIsLoading(true)
      onLoadingChange?.(true)
      apiFetch<IBlogTag>(`/api/admin/blog-tags/${tagId}`)
        .then((data) => {
          slugHelper.setSlug(data.slug)
          reset({
            name: data.name,
            slug: data.slug,
            status: data.status,
            sortOrder: data.sortOrder,
            excerpt: data.excerpt ?? '',
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
    }, [tagId])

    const onSubmit = async (data: IFormData) => {
      try {
        await apiFetch(`/api/admin/blog-tags/${tagId}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        })
        toast.success('Blog tag updated successfully')
        onSaveSuccess?.()
      } catch (e) {
        handleException(e as IApiError)
      }
    }

    useImperativeHandle(ref, () => ({
      submit: handleSubmit(onSubmit),
    }))

    if (isLoading) {
      return <BlogTagFormSkeleton showFooter={!!footer} />
    }

    return (
      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="name"
            label="Name"
            required
            placeholder="Tag name"
            disabled={!canUpdate || isSubmitting || isDeleted}
            errorMessage={errors.name?.message}
            {...register('name')}
          />
          <Input
            id="slug"
            label="Slug"
            required
            placeholder="tag-slug"
            disabled={!canUpdate || isSubmitting || isDeleted}
            errorMessage={errors.slug?.message}
            value={slugHelper.slug}
            onChange={(e) => {
              slugHelper.setSlug(e.target.value)
              setValue('slug', e.target.value, { shouldValidate: true })
            }}
          />
          <Select
            id="status"
            label="Status"
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
            ]}
            value={watchedStatus}
            onChange={(v) =>
              setValue('status', (v ?? 'draft') as 'draft' | 'published', {
                shouldValidate: true,
              })
            }
            disabled={!canUpdate || isSubmitting || isDeleted}
          />
          <Input
            id="sortOrder"
            label="Sort Order"
            type="number"
            placeholder="0"
            disabled={!canUpdate || isSubmitting || isDeleted}
            errorMessage={errors.sortOrder?.message}
            {...register('sortOrder', { valueAsNumber: true })}
          />
        </div>

        <Textarea
          id="excerpt"
          label="Excerpt"
          placeholder="A short description of this tag…"
          disabled={!canUpdate || isSubmitting || isDeleted}
          errorMessage={errors.excerpt?.message}
          className="col-span-full"
          {...register('excerpt')}
        />

        {footer}
      </form>
    )
  }
)

BlogTagEditForm.displayName = 'BlogTagEditForm'
