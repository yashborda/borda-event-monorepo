'use client'

import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'

import Image from 'next/image'

import * as React from 'react'

export type GalleryImage = { src: string; alt: string }

export const ServiceGallery = ({ images }: { images: GalleryImage[] }) => {
  const [active, setActive] = React.useState<number | null>(null)

  const close = React.useCallback(() => setActive(null), [])
  const step = React.useCallback(
    (dir: number) =>
      setActive((i) =>
        i === null ? i : (i + dir + images.length) % images.length
      ),
    [images.length]
  )

  React.useEffect(() => {
    if (active === null) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [active, close, step])

  if (!images.length) return null

  const current = active === null ? null : images[active]

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            onClick={() => setActive(i)}
            className="group border-border/60 relative aspect-square overflow-hidden rounded-md border shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {current && (
        <div
          onClick={close}
          className="bg-brand-ink/90 fixed inset-0 z-80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 rounded-md p-2 text-white/80 hover:text-white"
          >
            <IconX className="size-7" />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                step(-1)
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

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                step(1)
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
