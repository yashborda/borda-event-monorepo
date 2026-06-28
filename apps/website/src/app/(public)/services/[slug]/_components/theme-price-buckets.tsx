'use client'

import type { IServiceThemeVideo } from '@pkg/types';
import { cn } from '@pkg/ui';
import { IconX } from '@tabler/icons-react';



import Image from 'next/image';



import * as React from 'react';



import { type GalleryImage, PhotoSlider } from './photo-slider';
import { ThemeVideos } from './theme-videos';


























































export type BucketSection = {
  key: string
  title: string | null
  images: GalleryImage[]
  videos: IServiceThemeVideo[]
}

export type PriceBucketData = {
  key: string
  label: string
  sections: BucketSection[]
}

/** Stable DOM id for a theme's full-detail row, so a cover tile can scroll to it. */
const themeAnchorId = (key: string) => `theme-${key}`

/**
 * A theme has "extra" content (a full detail row worth scrolling to) only when
 * it carries more than one photo or any video. A lone single photo is fully
 * represented by its cover tile, so it skips the bottom row and opens a modal
 * preview instead.
 */
const hasExtraContent = (section: BucketSection) =>
  section.images.length > 1 || section.videos.length > 0

/** Full-screen single-image preview, dismissed by click, Escape, or the X. */
const ImageLightbox = ({
  image,
  onClose,
}: {
  image: GalleryImage
  onClose: () => void
}) => {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="bg-brand-ink/90 fixed inset-0 z-80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 rounded-md p-2 text-white/80 hover:text-white"
      >
        <IconX className="size-7" />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative h-[80vh] w-full max-w-4xl"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>
    </div>
  )
}

/**
 * Grid of theme covers shown at the top of an open price band — one tile per
 * theme that has at least one photo, using its first image as the cover. A
 * theme with extra content (more photos / a video) smooth-scrolls to its full
 * details below; a single-photo theme opens a full-screen modal preview.
 */
const ThemeCoverGrid = ({ sections }: { sections: BucketSection[] }) => {
  const [preview, setPreview] = React.useState<GalleryImage | null>(null)
  const covers = sections.filter((s) => s.images.length > 0)
  if (covers.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {covers.map((section) => {
          const cover = section.images[0]
          const scrolls = hasExtraContent(section)
          const className =
            'border-border/60 bg-brand-ink/5 group relative block aspect-square overflow-hidden rounded-lg border shadow-sm'
          const inner = (
            <>
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {section.title && (
                <span className="from-brand-ink/85 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent p-3 text-sm font-medium text-white">
                  {section.title}
                </span>
              )}
            </>
          )

          return scrolls ? (
            <a
              key={section.key}
              href={`#${themeAnchorId(section.key)}`}
              className={className}
            >
              {inner}
            </a>
          ) : (
            <button
              key={section.key}
              type="button"
              onClick={() => setPreview(cover)}
              aria-label={`Preview ${section.title ?? 'theme'}`}
              className={className}
            >
              {inner}
            </button>
          )
        })}
      </div>

      {preview && (
        <ImageLightbox image={preview} onClose={() => setPreview(null)} />
      )}
    </>
  )
}

/** One theme: cover + extra photos slider on the left, video on the right. */
const ThemeRow = ({ section }: { section: BucketSection }) => {
  const photoCount = section.images.length
  const hasPhotos = photoCount > 0
  const hasVideos = section.videos.length > 0
  const split = hasPhotos && hasVideos
  // The vertical-stacking / tall-portrait layout only earns its keep when there
  // are MULTIPLE photos to slide through beside a video. With a single photo it
  // produced one tall tile per theme stacked down the page — so a single-photo
  // theme always uses the plain horizontal row of fixed-size tiles instead.
  const useVerticalSplit = split && photoCount > 1

  const perView = { base: 2, sm: 3, lg: 3 }
  // Vertical (stacked) only on mobile, where the photo column sits in its own
  // aspect-9/16 wrapper beside the portrait video. On desktop the photos stay
  // a horizontal 3-up strip.
  const vertical = useVerticalSplit
    ? { base: true, sm: false, lg: false }
    : false
  // On desktop the photo strip is 3 tiles wide in the wide (4fr) column while
  // the video is a tall 9/16 portrait in the narrow (1fr) column. Square tiles
  // would leave the photo strip much shorter than the video. A portrait tile
  // (~3/4 w:h) raises the strip's height so it matches the video's height.
  const tileAspect = useVerticalSplit ? 3 / 4 : 1

  return (
    <div
      id={themeAnchorId(section.key)}
      className={cn(
        'grid scroll-mt-24 items-start gap-4 sm:gap-0',
        split && 'grid-cols-2 sm:grid-cols-[3fr_1fr]'
      )}
    >
      {hasPhotos && (
        <div className={cn(useVerticalSplit && 'aspect-9/16 sm:aspect-auto')}>
          <PhotoSlider
            images={section.images}
            perView={perView}
            vertical={vertical}
            tileAspect={tileAspect}
          />
        </div>
      )}
      {hasVideos && (
        <div>
          <ThemeVideos videos={section.videos} />
        </div>
      )}
    </div>
  )
}

/**
 * Price bands, all rendered open. Each band shows its heading, a cover grid of
 * themes, and the full detail rows beneath — no collapse toggle.
 */
export const ThemePriceBuckets = ({
  buckets,
}: {
  buckets: PriceBucketData[]
}) => {
  return (
    <>
      {buckets.map((bucket, i) => {
        const themeCount = bucket.sections.length
        // Show the cover grid for multi-theme bands, OR whenever any theme is a
        // single-photo theme — those have no bottom row, so the grid is their
        // only on-page surface (and their modal-preview trigger).
        const showCoverGrid =
          themeCount > 1 ||
          bucket.sections.some(
            (s) => s.images.length > 0 && !hasExtraContent(s)
          )
        return (
          <div
            key={bucket.key}
            className={cn('py-8', i % 2 === 0 ? 'bg-muted/50' : 'bg-muted/30')}
          >
            <div className="mx-auto max-w-6xl overflow-hidden scroll-smooth rounded-xl">
              {/* <div className="flex items-baseline gap-3 px-5 py-4">
                <span className="text-brand-ink font-display text-lg font-bold md:text-xl">
                  {bucket.label}
                </span>
                <span className="text-muted-foreground text-sm">
                  {themeCount} {themeCount === 1 ? 'theme' : 'themes'}
                </span>
              </div> */}

              <div className="space-y-4 px-5 pt-2 pb-6 md:space-y-8">
                {/* Cover grid first — one tile per theme; tapping scrolls down
                  to that theme's full slider + video. Only worth showing when
                  the band holds more than one theme. */}
                {showCoverGrid && <ThemeCoverGrid sections={bucket.sections} />}
                {/* Bottom detail rows only for themes with extra content
                  (more photos or a video). A single-photo theme is already
                  fully shown by its cover tile + modal preview above.
                  Photo-only themes are listed first, then video themes —
                  a stable sort keeps each group's existing order. */}
                {bucket.sections
                  .filter(hasExtraContent)
                  .sort(
                    (a, b) =>
                      Number(a.videos.length > 0) - Number(b.videos.length > 0)
                  )
                  .map((section) => (
                    <ThemeRow key={section.key} section={section} />
                  ))}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
