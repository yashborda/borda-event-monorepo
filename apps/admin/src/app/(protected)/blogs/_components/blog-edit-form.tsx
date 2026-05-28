'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { IApiError, IBlogDetail } from '@pkg/types'
import {
  DatePicker,
  Input,
  MultiSelect,
  Select,
  Switch,
  TextEditor,
  Textarea,
  toast,
} from '@pkg/ui'
import { useForm } from 'react-hook-form'
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

import { BlogFormSkeleton } from './blog-form-skeleton'

const mediaFileSchema = z.object({
  id: z.string(),
  url: z.string(),
  folder: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
})

const schema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Slug must be at most 255 characters')
    .regex(
      /^[a-z0-9]+(?:[-][a-z0-9]+)*$/,
      'Slug must be lowercase with hyphens only'
    ),
  excerpt: z
    .string()
    .min(1, 'Excerpt is required')
    .max(500, 'Excerpt must be at most 500 characters'),
  content: z
    .string()
    .refine(
      (v) => v.replace(/<[^>]+>/g, '').trim().length > 0,
      'Content is required'
    ),
  authorId: z.string().min(1, 'Author is required'),
  categoryIds: z
    .array(z.string().uuid())
    .min(1, 'At least one category is required'),
  tagIds: z.array(z.string().uuid()).min(1, 'At least one tag is required'),
  featuredImage: mediaFileSchema.nullable().optional(),
  featuredImageAlt: z
    .string()
    .max(255, 'Alt text must be at most 255 characters')
    .optional(),
  status: z.enum(['draft', 'published']).optional(),
  publishedAt: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
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
  robots: z.enum(['index', 'noindex']).optional(),
  googlebot: z.enum(['index', 'noindex']).optional(),
})

type IFormData = z.infer<typeof schema>

export type IBlogEditFormRef = {
  submit: () => void
}

type IBlogEditFormProps = {
  blogId: string
  isDeleted?: boolean
  onLoad?: (info: {
    title: string
    status: string
    deletedAt: string | null
  }) => void
  onLoadingChange?: (loading: boolean) => void
  onSaveSuccess?: () => void
  onSubmittingChange?: (submitting: boolean) => void
  footer?: React.ReactNode
}

type IAuthorOption = { id: string; fullName: string; slug: string }
type ICategoryOption = { id: string; categoryName: string }
type ITagOption = { id: string; name: string }

export const BlogEditForm = forwardRef<IBlogEditFormRef, IBlogEditFormProps>(
  (
    {
      blogId,
      isDeleted: isDeletedProp,
      onLoad,
      onLoadingChange,
      onSaveSuccess,
      onSubmittingChange,
      footer,
    },
    ref
  ) => {
    const [loading, setLoading] = useState(true)
    const [blog, setBlog] = useState<IBlogDetail | null>(null)
    const [authors, setAuthors] = useState<IAuthorOption[]>([])
    const [categories, setCategories] = useState<ICategoryOption[]>([])
    const [tags, setTags] = useState<ITagOption[]>([])

    const {
      register,
      handleSubmit,
      setValue,
      watch,
      trigger,
      reset,
      formState: { errors, isSubmitting, isSubmitted },
    } = useForm<IFormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        status: 'draft',
        isFeatured: false,
        categoryIds: [],
        tagIds: [],
        robots: 'index',
        googlebot: 'index',
      },
    })

    const { can } = usePermissions()
    const canUpdate = can('blogs:update')

    const { slug, setSlug, onSourceChange, resetManualEdit } = useSlug()
    const watchedStatus = watch('status')
    const watchedPublishedAt = watch('publishedAt')
    const watchedContent = watch('content')
    const watchedAuthorId = watch('authorId')
    const watchedCategoryIds = watch('categoryIds')
    const watchedTagIds = watch('tagIds')
    const watchedIsFeatured = watch('isFeatured')
    const watchedFeaturedImage = watch('featuredImage')
    const featuredImageRef = useRef<ImageUploadHandle>(null)
    const seoFieldsRef = useRef<SeoFieldsHandle>(null)

    useEffect(() => {
      setValue('slug', slug)
    }, [slug, setValue])

    useEffect(() => {
      setLoading(true)
      onLoadingChange?.(true)

      Promise.all([
        apiFetch<IBlogDetail>(`/api/admin/blogs/${blogId}`),
        apiFetch<{ data: IAuthorOption[] }>(
          '/api/admin/blog-authors?limit=100&includeDeleted=false&statusFilter=active'
        ),
        apiFetch<{ data: ICategoryOption[] }>(
          '/api/admin/blog-categories?limit=100&includeDeleted=false&statusFilter=published'
        ),
        apiFetch<{ data: ITagOption[] }>(
          '/api/admin/blog-tags?limit=100&includeDeleted=false&statusFilter=published'
        ),
      ])
        .then(([b, authorsRes, categoriesRes, tagsRes]) => {
          setBlog(b)
          setAuthors(authorsRes.data)
          setCategories(categoriesRes.data)
          setTags(tagsRes.data)

          resetManualEdit()
          setSlug(b.slug)

          reset({
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt ?? undefined,
            content: b.content ?? undefined,
            authorId: b.author?.id ?? undefined,
            categoryIds: b.categories?.map((c) => c.id) ?? [],
            tagIds: b.tags?.map((t) => t.id) ?? [],
            featuredImage: b.featuredImage ?? undefined,
            featuredImageAlt: b.featuredImageAlt ?? undefined,
            status: b.status,
            publishedAt: b.publishedAt ?? null,
            isFeatured: b.isFeatured ?? false,
            metaTitle: b.metaTitle ?? undefined,
            metaDescription: b.metaDescription ?? undefined,
            metaKeywords: b.metaKeywords ?? undefined,
            canonicalUrl: b.canonicalUrl ?? undefined,
            ogTitle: b.ogTitle ?? undefined,
            ogDescription: b.ogDescription ?? undefined,
            ogImage: b.ogImage ?? undefined,
            twitterTitle: b.twitterTitle ?? undefined,
            twitterDescription: b.twitterDescription ?? undefined,
            twitterImage: b.twitterImage ?? undefined,
            robots: b.robots ?? 'index',
            googlebot: b.googlebot ?? 'index',
          })

          onLoad?.({
            title: b.title,
            status: b.status,
            deletedAt: b.deletedAt ?? null,
          })
        })
        .catch((e: IApiError) => handleException(e))
        .finally(() => {
          setLoading(false)
          onLoadingChange?.(false)
        })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blogId])

    const handleFormSubmit = async () => {
      if (!(await trigger())) return
      onSubmittingChange?.(true)
      try {
        const featuredImage = await featuredImageRef.current!.upload()
        if (featuredImage === undefined) return
        const seoImages = await seoFieldsRef.current!.uploadImages()
        if (
          seoImages.ogImage === undefined ||
          seoImages.twitterImage === undefined
        )
          return
        await handleSubmit(async (data) => {
          try {
            await apiFetch(`/api/admin/blogs/${blogId}`, {
              method: 'PATCH',
              body: JSON.stringify({
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                authorId: data.authorId,
                categoryIds: data.categoryIds,
                tagIds: data.tagIds,
                featuredImageAlt: data.featuredImageAlt,
                status: data.status,
                publishedAt: data.publishedAt ?? null,
                isFeatured: data.isFeatured,
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
                featuredImageId: featuredImage?.id ?? null,
                ogImageId: seoImages.ogImage?.id ?? null,
                twitterImageId: seoImages.twitterImage?.id ?? null,
              }),
            })
            toast.success('Blog post updated successfully')
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

    if (loading || !blog) return <BlogFormSkeleton showFooter={!!footer} />

    const isDeleted = isDeletedProp ?? !!blog.deletedAt

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
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="title"
              label="Title"
              required
              placeholder="Enter blog title"
              disabled={!canUpdate || isSubmitting || isDeleted}
              errorMessage={errors.title?.message}
              {...register('title', {
                onChange: (e) => onSourceChange(e.target.value),
              })}
            />
            <Input
              id="slug"
              label="Slug"
              required
              placeholder="auto-generated-slug"
              disabled={!canUpdate || isSubmitting || isDeleted}
              errorMessage={errors.slug?.message}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <Textarea
            id="excerpt"
            label="Excerpt"
            placeholder="Short description of the blog post"
            rows={3}
            required
            disabled={!canUpdate || isSubmitting || isDeleted}
            errorMessage={errors.excerpt?.message}
            {...register('excerpt')}
          />
          <TextEditor
            value={watchedContent ?? ''}
            onChange={(v) =>
              setValue('content', v, {
                shouldDirty: true,
                shouldValidate: isSubmitted,
              })
            }
            disabled={!canUpdate || isSubmitting || isDeleted}
            label="Content"
            required
            errorMessage={errors.content?.message}
          />
        </div>

        {/* Media */}
        <div className="flex flex-col gap-4">
          <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
            Media
          </h3>
          <ImageUpload
            ref={featuredImageRef}
            deferred
            folder="blogs"
            label="Featured Image"
            value={watchedFeaturedImage ?? null}
            onChange={(media) =>
              setValue('featuredImage', media, { shouldValidate: true })
            }
            disabled={!canUpdate || isSubmitting || isDeleted}
          />
          <Input
            id="featuredImageAlt"
            label="Featured Image Alt Text"
            placeholder="Describe the image for accessibility"
            disabled={!canUpdate || isSubmitting || isDeleted}
            errorMessage={errors.featuredImageAlt?.message}
            {...register('featuredImageAlt')}
          />
        </div>

        {/* Taxonomy */}
        <div className="flex flex-col gap-4">
          <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
            Taxonomy
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              id="authorId"
              label="Author"
              required
              options={authors.map((a) => ({ label: a.fullName, value: a.id }))}
              value={watchedAuthorId ?? undefined}
              onChange={(v) =>
                setValue('authorId', v as string, { shouldValidate: true })
              }
              placeholder="Select author…"
              disabled={!canUpdate || isSubmitting || isDeleted}
              errorMessage={errors.authorId?.message}
            />
            <MultiSelect
              id="categoryIds"
              label="Categories"
              placeholder="Select categories…"
              required
              searchable
              options={categories.map((c) => ({
                label: c.categoryName,
                value: c.id,
              }))}
              value={watchedCategoryIds ?? []}
              onChange={(v) =>
                setValue('categoryIds', v as string[], { shouldValidate: true })
              }
              disabled={!canUpdate || isSubmitting || isDeleted}
              errorMessage={errors.categoryIds?.message}
            />
            <MultiSelect
              id="tagIds"
              label="Tags"
              placeholder="Select tags…"
              required
              searchable
              options={tags.map((t) => ({ label: t.name, value: t.id }))}
              value={watchedTagIds ?? []}
              onChange={(v) =>
                setValue('tagIds', v as string[], { shouldValidate: true })
              }
              disabled={!canUpdate || isSubmitting || isDeleted}
              errorMessage={errors.tagIds?.message}
            />
          </div>
        </div>

        {/* Publication */}
        <div className="flex flex-col gap-4">
          <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
            Publication
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="status"
              label="Status"
              options={[
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
              ]}
              value={watchedStatus ?? undefined}
              onChange={(v) =>
                setValue('status', (v ?? 'draft') as 'draft' | 'published', {
                  shouldValidate: true,
                })
              }
              disabled={!canUpdate || isSubmitting || isDeleted}
            />
            <DatePicker
              id="publishedAt"
              label="Publish Date"
              value={watchedPublishedAt}
              onChange={(v) => setValue('publishedAt', v)}
              disabled={!canUpdate || isSubmitting || isDeleted}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="isFeatured"
              checked={watchedIsFeatured ?? false}
              onCheckedChange={(v) => setValue('isFeatured', v)}
              disabled={!canUpdate || isSubmitting || isDeleted}
            />
            <label
              htmlFor="isFeatured"
              className="text-body-md cursor-pointer select-none"
            >
              Featured Post
            </label>
          </div>
        </div>

        {/* SEO */}
        <SeoFields
          ref={seoFieldsRef}
          deferred
          folder="blogs"
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          disabled={!canUpdate || isSubmitting || isDeleted}
        />

        {footer}
      </form>
    )
  }
)

BlogEditForm.displayName = 'BlogEditForm'
