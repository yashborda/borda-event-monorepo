'use client'

import { cn } from '@pkg/ui'
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'

import Image from 'next/image'

import * as React from 'react'

export type GalleryImage = { src: string; alt: string }

const AUTOPLAY_MS = 3500

/**
 * Autoplaying slider with prev/next arrows, dot indicators, and a full-screen
 * lightbox on click. Autoplay pauses while the lightbox is open or the pointer
 * is hovering the slider.
 *
 * `perView` controls how many photos are visible at once (default 1). A 2-up
 * slider steps one photo at a time, so consecutive pairs overlap
 * (1+2 → 2+3 → 3+4 …). Used for themes that have no paired video.
 */
export const PhotoSlider = ({
  images,
  perView = 1,
}: {
  images: GalleryImage[]
  perView?: 1 | 2
}) => {
  const [index, setIndex] = React.useState(0)
  // Lightbox tracks an individual photo (-1 = closed) so it can step
  // per-photo independently of the slider's per-window stepping.
  const [lightboxIndex, setLightboxIndex] = React.useState(-1)
  const [paused, setPaused] = React.useState(false)

  const lightbox = lightboxIndex >= 0
  const setLightbox = (open: boolean) => setLightboxIndex(open ? index : -1)

  const count = images.length
  // A 2-up slider with a single photo degrades to a normal full-width slider.
  const lanes = Math.min(perView, count) as 1 | 2
  // Last index a window can start at so the final photo stays visible.
  const maxStart = Math.max(0, count - lanes)
  const steps = maxStart + 1
  const go = React.useCallback(
    (dir: number) => setIndex((i) => (i + dir + steps) % steps),
    [steps]
  )
  const goLightbox = React.useCallback(
    (dir: number) => setLightboxIndex((i) => (i + dir + count) % count),
    [count]
  )

  // Autoplay — paused on hover or while the lightbox is open.
  React.useEffect(() => {
    if (steps <= 1 || paused || lightbox) return
    const id = setInterval(() => setIndex((i) => (i + 1) % steps), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [steps, paused, lightbox])

  // Lightbox keyboard nav + scroll lock.
  React.useEffect(() => {
    if (!lightbox) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(-1)
      else if (e.key === 'ArrowLeft') goLightbox(-1)
      else if (e.key === 'ArrowRight') goLightbox(1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, goLightbox])

  // Clamp if the image list shrinks below the current window start.
  if (index > maxStart) setIndex(maxStart)

  const current = images[lightbox ? lightboxIndex : index]

  return (
    <>
      <div
        className="group relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {lanes === 2 ? (
          // 2-up carousel: a sliding track of half-width slides, stepping one
          // photo per click so consecutive pairs overlap (1+2 → 2+3 → …). Each
          // slide is its own rounded, bordered card with a gap between the two
          // visible photos (via per-slide horizontal padding).
          <div className="relative aspect-square w-full overflow-hidden">
            <div
              className="flex h-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${index * 50}%)` }}
            >
              {images.map((img, i) => (
                <button
                  key={img.src + i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Enlarge photo ${i + 1} of ${count}`}
                  className="h-full w-1/2 shrink-0 px-1.5"
                >
                  <div className="border-border/60 bg-brand-ink/5 relative h-full w-full overflow-hidden rounded-lg border shadow-sm">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      priority={i < 2}
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label={`Enlarge photo ${index + 1} of ${count}`}
            className="border-border/60 bg-brand-ink/5 relative block aspect-9/16 w-full overflow-hidden rounded-lg border shadow-sm"
          >
            {images.map((img, i) => (
              <Image
                key={img.src + i}
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                priority={i === 0}
                className={cn(
                  'object-cover transition-opacity duration-700',
                  i === index ? 'opacity-100' : 'opacity-0'
                )}
              />
            ))}
          </button>
        )}

        {steps > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute top-1/2 left-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white"
            >
              <IconChevronLeft className="size-5" stroke={1.75} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute top-1/2 right-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white"
            >
              <IconChevronRight className="size-5" stroke={1.75} />
            </button>

            <div className="mt-3 flex justify-center gap-1.5">
              {Array.from({ length: steps }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to photo ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === index
                      ? 'bg-brand-copper w-5'
                      : 'bg-brand-copper/30 hover:bg-brand-copper/60 w-1.5'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          className="bg-brand-ink/90 fixed inset-0 z-80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute top-4 right-4 rounded-md p-2 text-white/80 hover:text-white"
          >
            <IconX className="size-7" />
          </button>

          {count > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goLightbox(-1)
              }}
              aria-label="Previous"
              className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"
            >
              <IconChevronLeft className="size-7" />
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[80vh] w-full max-w-4xl"
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {count > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goLightbox(1)
              }}
              aria-label="Next"
              className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"
            >
              <IconChevronRight className="size-7" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
