'use client'

import { cn } from '@pkg/ui'
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'

import Image from 'next/image'

import * as React from 'react'

export type GalleryImage = { src: string; alt: string }

const AUTOPLAY_MS = 3500

/** How many photos are visible at each breakpoint. */
export type PerView = { base: number; sm: number; lg: number }

// Tailwind's `sm` (640px) and `lg` (1024px) breakpoints, mirrored in JS so the
// slider can compute its lane count (CSS % transforms can't be breakpointed).
const SM = 640
const LG = 1024

/** Resolve the active lane count for the current viewport width. */
const lanesFor = (perView: PerView, width: number): number =>
  width >= LG ? perView.lg : width >= SM ? perView.sm : perView.base

/**
 * Autoplaying slider with prev/next arrows, dot indicators, and a full-screen
 * lightbox on click. Autoplay pauses while the lightbox is open or the pointer
 * is hovering the slider.
 *
 * `perView` controls how many photos are visible at once per breakpoint
 * (default 1 everywhere). A multi-up slider steps one photo at a time, so
 * consecutive windows overlap (1+2+3 → 2+3+4 …).
 */
export const PhotoSlider = ({
  images,
  perView = { base: 1, sm: 1, lg: 1 },
}: {
  images: GalleryImage[]
  perView?: PerView
}) => {
  const [index, setIndex] = React.useState(0)
  // Lane count tracks the live viewport width so it can differ per breakpoint.
  const [vw, setVw] = React.useState(LG)
  React.useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  // Lightbox tracks an individual photo (-1 = closed) so it can step
  // per-photo independently of the slider's per-window stepping.
  const [lightboxIndex, setLightboxIndex] = React.useState(-1)
  const [paused, setPaused] = React.useState(false)

  const lightbox = lightboxIndex >= 0
  const setLightbox = (open: boolean) => setLightboxIndex(open ? index : -1)

  const count = images.length
  // Never show more lanes than we have photos (a 3-up with 1 photo degrades to
  // a normal full-width slider).
  const lanes = Math.max(1, Math.min(lanesFor(perView, vw), count))
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
        {lanes >= 2 ? (
          // Multi-up carousel: a sliding track of equal-width slides (100/lanes
          // %), stepping one photo per click so consecutive windows overlap
          // (1+2+3 → 2+3+4 …). Each slide is its own rounded, bordered card with
          // a gap between visible photos (via per-slide horizontal padding).
          // Lane count is breakpoint-driven, so widths are computed in JS.
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: `${lanes} / 1` }}
          >
            <div
              className="flex h-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${(index * 100) / lanes}%)` }}
            >
              {images.map((img, i) => (
                <button
                  key={img.src + i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Enlarge photo ${i + 1} of ${count}`}
                  className="h-full shrink-0 px-1.5"
                  style={{ width: `${100 / lanes}%` }}
                >
                  <div className="border-border/60 bg-brand-ink/5 relative h-full w-full overflow-hidden rounded-lg border shadow-sm">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 22vw"
                      priority={i < lanes}
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
