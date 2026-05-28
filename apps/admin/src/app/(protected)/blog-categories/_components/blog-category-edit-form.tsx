'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError, IBlogCategoryDetail } from '@pkg/types'
import { Input, Select, Textarea, toast } from '@pkg/ui'
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
import { SeoFields, type SeoFieldsHandle } from '@/components/seo-fields'

import { BlogCategoryFormSkeleton } from './blog-category-form-skeleton'

const slugRegex = /^[a-z0-9]+(?:[-][a-z0-9]+)*$/

const mediaFileSchema = z.object({
  id: z.string(),
  url: z.string(),
  folder: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
})

const schema = z.object({
  categoryName: z
    .string()
    .min(1, 'Category name is required')
    .max(255, 'Category name must be at most 255 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Slug must be at most 255 characters')
    .regex(slugRegex, 'Only lowercase letters, numbers, and hyphens allowed'),
  status: z.enum(['draft', 'published']),
  bannerImage: mediaFileSchema.nullable().optional(),
  sortOrder: z.number(),
  excerpt: z
    .string()
    .max(500, 'Excerpt must be at most 500 characters')
    .optional(),
  metaTitle: z
    .string()
    .min(1, 'Meta title is required')
    .max(255, 'Meta title must be at most 255 characters'),
  metaDescription: z
    .string()
    .min(1, 'Meta description is required')
    .max(500, 'Meta description must be at most 500 characters'),
  metaKeywords: z
    .string()
    .min(1, 'Meta keywords are required')
    .max(500, 'Meta keywords must be at most 500 characters'),
  canonicalUrl: z
    .string()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), 'Must be a valid URL')
    .optional(),
  ogTitle: z
    .string()
    .max(255, 'OG title must be at most 255 characters')
    .optional(),
  ogDescription: z
    .string()
    .max(500, 'OG description must be at most 500 characters')
    .optional(),
  ogImage: mediaFileSchema.nullable().optional(),
  twitterTitle: z
    .string()
    .max(255, 'Twitter title must be at most 255 characters')
    .optional(),
  twitterDescription: z
    .string()
    .max(500, 'Twitter description must be at most 500 characters')
    .optional(),
  twitterImage: mediaFileSchema.nullable().optional(),
  robots: z.enum(['index', 'noindex']),
  googlebot: z.enum(['index', 'noindex']),
})

type IFormData = z.infer<typeof schema>

export type IBlogCategoryEditFormRef = {
  submit: () => void
}

type IBlogCategoryEditFormProps = {
  categoryId: string
  onLoad?: (data: IBlogCategoryDetail) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

export const BlogCategoryEditForm = forwardRef<
  IBlogCategoryEditFormRef,
  IBlogCategoryEditFormProps
>(
  (
    {
      categoryId,
      onLoad,
      onLoadingChange,
      onSaveSuccess,
      onSubmittingChange,
      footer,
    },
    ref
  ) => {
    const { can } = usePermissions()
    const canUpdate = can('blog-categories:update')

    const [isLoading, setIsLoading] = useState(true)
    const slugHelper = useSlug()

    const {
      register,
      handleSubmit,
      control,
      setValue,
      watch,
      trigger,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<IFormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        status: 'draft',
        sortOrder: 0,
        robots: 'index',
        googlebot: 'index',
      },
    })

    const categoryName = useWatch({ control, name: 'categoryName' })
    const watchedStatus = useWatch({ control, name: 'status' })
    const watchedBannerImage = useWatch({ control, name: 'bannerImage' })
    const bannerImageRef = useRef<ImageUploadHandle>(null)
    const seoFieldsRef = useRef<SeoFieldsHandle>(null)

    useEffect(() => {
      slugHelper.onSourceChange(categoryName ?? '')
    }, [categoryName, slugHelper.onSourceChange])

    useEffect(() => {
      setValue('slug', slugHelper.slug)
    }, [slugHelper.slug, setValue])

    const handleFormSubmit = async () => {
      if (!(await trigger())) return
      onSubmittingChange?.(true)
      try {
        const bannerImage = await bannerImageRef.current!.upload()
        if (bannerImage === undefined) return
        const seoImages = await seoFieldsRef.current!.uploadImages()
        if (
          seoImages.ogImage === undefined ||
          seoImages.twitterImage === undefined
        )
          return
        await handleSubmit(async (data) => {
          try {
            await apiFetch(`/api/admin/blog-categories/${categoryId}`, {
              method: 'PATCH',
              body: JSON.stringify({
                categoryName: data.categoryName,
                slug: data.slug,
                status: data.status,
                sortOrder: data.sortOrder,
                excerpt: data.excerpt || undefined,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                metaKeywords: data.metaKeywords,
                canonicalUrl: data.canonicalUrl,
                ogTitle: data.ogTitle,
                ogDescription: data.ogDescription,
                twitterTitle: data.twitterTitle,
                twitterDescription: data.twitterDescription,
                robots: data.robots,
                googlebot: data.googlebot,
                bannerImageId: bannerImage?.id ?? null,
                ogImageId: seoImages.ogImage?.id ?? null,
                twitterImageId: seoImages.twitterImage?.id ?? null,
              }),
            })
            toast.success('Blog category updated successfully')
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

    useEffect(() => {
      setIsLoading(true)
      onLoadingChange?.(true)
      apiFetch<IBlogCategoryDetail>(`/api/admin/blog-categories/${categoryId}`)
        .then((data) => {
          slugHelper.setSlug(data.slug)
          reset({
            categoryName: data.categoryName,
            slug: data.slug,
            status: data.status,
            bannerImage: data.bannerImage ?? undefined,
            sortOrder: data.sortOrder,
            excerpt: data.excerpt ?? undefined,
            metaTitle: data.metaTitle ?? undefined,
            metaDescription: data.metaDescription ?? undefined,
            metaKeywords: data.metaKeywords ?? undefined,
            canonicalUrl: data.canonicalUrl ?? undefined,
            ogTitle: data.ogTitle ?? undefined,
            ogDescription: data.ogDescription ?? undefined,
            ogImage: data.ogImage ?? undefined,
            twitterTitle: data.twitterTitle ?? undefined,
            twitterDescription: data.twitterDescription ?? undefined,
            twitterImage: data.twitterImage ?? undefined,
            robots: data.robots,
            googlebot: data.googlebot,
          })
          onLoad?.(data)
        })
        .catch((e: IApiError) => handleException(e))
        .finally(() => {
          setIsLoading(false)
          onLoadingChange?.(false)
        })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId])

    if (isLoading) {
      return <BlogCategoryFormSkeleton showFooter={!!footer} />
    }

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="categoryName"
              label="Category Name"
              required
              placeholder="Category name"
              disabled={!canUpdate || isSubmitting}
              errorMessage={errors.categoryName?.message}
              {...register('categoryName')}
            />
            <Input
              id="slug"
              label="Slug"
              required
              placeholder="category-slug"
              disabled={!canUpdate || isSubmitting}
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
              disabled={!canUpdate || isSubmitting}
            />
            <Input
              id="sortOrder"
              label="Sort Order"
              type="number"
              placeholder="0"
              disabled={!canUpdate || isSubmitting}
              errorMessage={errors.sortOrder?.message}
              {...register('sortOrder', { valueAsNumber: true })}
            />
            <ImageUpload
              ref={bannerImageRef}
              deferred
              folder="blog-categories"
              label="Banner Image"
              value={watchedBannerImage ?? null}
              onChange={(media) =>
                setValue('bannerImage', media, { shouldValidate: true })
              }
              disabled={!canUpdate || isSubmitting}
              errorMessage={errors.bannerImage?.message}
              className="col-span-full"
            />
            <Textarea
              id="excerpt"
              label="Excerpt"
              placeholder="A short description of this category…"
              disabled={!canUpdate || isSubmitting}
              errorMessage={errors.excerpt?.message}
              className="col-span-full"
              {...register('excerpt')}
            />
          </div>
        </div>

        {/* SEO */}
        <SeoFields
          ref={seoFieldsRef}
          deferred
          folder="blog-categories"
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          disabled={!canUpdate || isSubmitting}
        />

        {footer}
      </form>
    )
  }
)

BlogCategoryEditForm.displayName = 'BlogCategoryEditForm'
