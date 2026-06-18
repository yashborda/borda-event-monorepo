'use client'

import { cn } from '@pkg/ui'
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'

import Image from 'next/image'

import * as React from 'react'

export type GalleryImage = { src: string; alt: string }

const AUTOPLAY_MS = 3500

/**
 * Autoplaying single-image slider (one photo at a time) with prev/next arrows,
 * dot indicators, and a full-screen lightbox on click. Autoplay pauses while
 * the lightbox is open or the pointer is hovering the slider.
 */
export const PhotoSlider = ({ images }: { images: GalleryImage[] }) => {
  const [index, setIndex] = React.useState(0)
  const [lightbox, setLightbox] = React.useState(false)
  const [paused, setPaused] = React.useState(false)

  const count = images.length
  const go = React.useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  )

  // Autoplay — paused on hover or while the lightbox is open.
  React.useEffect(() => {
    if (count <= 1 || paused || lightbox) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [count, paused, lightbox])

  // Lightbox keyboard nav + scroll lock.
  React.useEffect(() => {
    if (!lightbox) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, go])

  if (!count) return null

  const current = images[index]

  return (
    <>
      <div
        className="group relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
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

        {count > 1 && (
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
              {images.map((img, i) => (
                <button
                  key={img.src + i}
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
                go(-1)
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
                go(1)
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
