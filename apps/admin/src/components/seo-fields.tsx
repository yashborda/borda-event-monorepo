'use client'

import type { IMediaFile } from '@pkg/types'
import { Input, Select, Textarea } from '@pkg/ui'
import {
  type FieldErrors,
  type FieldValues,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form'

import { forwardRef, useImperativeHandle, useRef } from 'react'

import { ImageUpload, type ImageUploadHandle } from './image-upload'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SeoFieldsProps<T extends FieldValues = any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: UseFormWatch<any>
  errors: FieldErrors<T>
  disabled?: boolean
  /** Folder to upload OG/Twitter images into (e.g. 'blogs', 'blog-categories'). */
  folder?: string
  /** When true, image file selection only stores the file locally for preview.
   *  The actual upload happens when the ref's `uploadImages()` is called. */
  deferred?: boolean
}

export type SeoFieldsHandle = {
  /** Upload any pending OG/Twitter images and return their IMediaFile objects.
   *  Returns undefined for a field if its upload fails (caller should abort). */
  uploadImages: () => Promise<{
    ogImage: IMediaFile | null | undefined
    twitterImage: IMediaFile | null | undefined
  }>
}

type RobotsOption = { value: string; label: string }

const ROBOTS_OPTIONS: RobotsOption[] = [
  { value: 'index', label: 'index' },
  { value: 'noindex', label: 'noindex' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SeoFields = forwardRef<SeoFieldsHandle, SeoFieldsProps<any>>(
  function SeoFields(
    {
      register,
      setValue,
      watch,
      errors,
      disabled,
      folder = 'general',
      deferred = false,
    },
    ref
  ) {
    const ogImageRef = useRef<ImageUploadHandle>(null)
    const twitterImageRef = useRef<ImageUploadHandle>(null)

    useImperativeHandle(ref, () => ({
      uploadImages: async () => {
        const [ogImage, twitterImage] = await Promise.all([
          ogImageRef.current?.upload() ?? null,
          twitterImageRef.current?.upload() ?? null,
        ])
        return { ogImage, twitterImage }
      },
    }))

    const err = (field: string) => {
      const e = (errors as Record<string, unknown>)[field]
      return e ? String((e as { message?: string }).message ?? '') : undefined
    }

    const robots = watch('robots') as string | undefined
    const googlebot = watch('googlebot') as string | undefined
    const ogImage = watch('ogImage') as IMediaFile | null | undefined
    const twitterImage = watch('twitterImage') as IMediaFile | null | undefined

    return (
      <div className="flex flex-col gap-10">
        {/* SEO */}
        <div className="space-y-4">
          <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
            SEO
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="metaTitle"
              label="Meta Title"
              required
              placeholder="Page title for search engines"
              disabled={disabled}
              errorMessage={err('metaTitle')}
              {...register('metaTitle')}
            />
            <Input
              id="canonicalUrl"
              label="Canonical URL"
              placeholder="https://example.com/page"
              disabled={disabled}
              errorMessage={err('canonicalUrl')}
              {...register('canonicalUrl')}
            />
          </div>
          <Textarea
            id="metaDescription"
            label="Meta Description"
            required
            placeholder="Brief description for search results (150–160 chars)"
            rows={3}
            disabled={disabled}
            errorMessage={err('metaDescription')}
            {...register('metaDescription')}
          />
          <Input
            id="metaKeywords"
            label="Meta Keywords"
            required
            placeholder="keyword1, keyword2, keyword3"
            disabled={disabled}
            errorMessage={err('metaKeywords')}
            {...register('metaKeywords')}
          />
        </div>

        {/* Robots */}
        <div className="space-y-4">
          <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
            Robots
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="robots"
              label="Robots"
              options={ROBOTS_OPTIONS}
              value={robots ?? 'index'}
              onChange={(v) => setValue('robots', v ?? 'index')}
              disabled={disabled}
            />
            <Select
              id="googlebot"
              label="Googlebot"
              options={ROBOTS_OPTIONS}
              value={googlebot ?? 'index'}
              onChange={(v) => setValue('googlebot', v ?? 'index')}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Open Graph */}
        <div className="space-y-4">
          <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
            Open Graph
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="ogTitle"
              label="OG Title"
              placeholder="Title for social sharing"
              disabled={disabled}
              errorMessage={err('ogTitle')}
              {...register('ogTitle')}
            />
            <Input
              id="ogDescription"
              label="OG Description"
              placeholder="Description for social sharing"
              disabled={disabled}
              errorMessage={err('ogDescription')}
              {...register('ogDescription')}
            />
          </div>
          <ImageUpload
            ref={ogImageRef}
            deferred={deferred}
            folder={folder}
            label="OG Image"
            value={ogImage}
            onChange={(media) => setValue('ogImage', media)}
            disabled={disabled}
          />
        </div>

        {/* Twitter */}
        <div className="space-y-4">
          <h3 className="text-body-sm text-muted-foreground font-semibold tracking-wide uppercase">
            Twitter Card
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="twitterTitle"
              label="Twitter Title"
              placeholder="Title for Twitter card"
              disabled={disabled}
              errorMessage={err('twitterTitle')}
              {...register('twitterTitle')}
            />
            <Input
              id="twitterDescription"
              label="Twitter Description"
              placeholder="Description for Twitter card"
              disabled={disabled}
              errorMessage={err('twitterDescription')}
              {...register('twitterDescription')}
            />
          </div>
          <ImageUpload
            ref={twitterImageRef}
            deferred={deferred}
            folder={folder}
            label="Twitter Image"
            value={twitterImage}
            onChange={(media) => setValue('twitterImage', media)}
            disabled={disabled}
          />
        </div>
      </div>
    )
  }
)
