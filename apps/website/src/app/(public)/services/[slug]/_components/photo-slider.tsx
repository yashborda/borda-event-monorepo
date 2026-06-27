'use client'

import { cn } from '@pkg/ui'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconX,
} from '@tabler/icons-react'

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

/** Which breakpoints render the slider vertically (stacked, Y-axis sliding). */
export type Vertical = boolean | { base: boolean; sm: boolean; lg: boolean }

const verticalFor = (v: Vertical, width: number): boolean =>
  typeof v === 'boolean' ? v : width >= LG ? v.lg : width >= SM ? v.sm : v.base

/**
 * Autoplaying slider with prev/next arrows, dot indicators, and a full-screen
 * lightbox on click. Autoplay pauses while the lightbox is open or the pointer
 * is hovering the slider.
 *
 * `perView` controls how many photos are visible at once per breakpoint
 * (default 1 everywhere). A multi-up slider steps one photo at a time, so
 * consecutive windows overlap (1+2+3 → 2+3+4 …).
 *
 * `tileAspect` is each visible tile's width/height ratio in a multi-up slider
 * (default 1 = square). Pass a portrait value (e.g. 3/4) when the slider sits
 * in a narrow column beside a portrait video, so the tiles don't squish flat.
 *
 * `vertical` stacks the visible tiles top-to-bottom (instead of left-to-right)
 * and sliding moves on the Y axis. The slider then fills its parent's height —
 * use it beside a tall portrait video so the photo column matches its height
 * instead of leaving an empty gap below a short horizontal strip. Accepts a
 * per-breakpoint object (e.g. vertical only on mobile).
 */
export const PhotoSlider = ({
  images,
  perView = { base: 1, sm: 1, lg: 1 },
  tileAspect = 1,
  vertical = false,
}: {
  images: GalleryImage[]
  perView?: PerView
  tileAspect?: number
  vertical?: Vertical
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
  // Orientation resolved from the live width (vertical can be mobile-only).
  const isVertical = verticalFor(vertical, vw)
  // Lightbox tracks an individual photo (-1 = closed) so it can step
  // per-photo independently of the slider's per-window stepping.
  const [lightboxIndex, setLightboxIndex] = React.useState(-1)
  const [paused, setPaused] = React.useState(false)

  const lightbox = lightboxIndex >= 0
  const setLightbox = (open: boolean) => setLightboxIndex(open ? index : -1)

  const count = images.length
  // Tile size is ALWAYS based on the breakpoint's per-view count, so each photo
  // renders at a fixed size whether the theme has 1 photo or 20 — a single
  // image no longer blows up to full width. We only ever shrink the visual lane
  // count below the per-view value when there's just one photo (so it isn't a
  // lonely third of the row); otherwise tiles keep their fixed footprint.
  // `lanes` = the breakpoint's per-view count, used as the tile-size unit so a
  // tile is the SAME fixed size regardless of how many photos a theme has.
  const lanes = Math.max(1, lanesFor(perView, vw))
  // How many tiles are actually filled (≤ lanes). When fewer photos than lanes,
  // the track is narrowed to this many tiles so each tile keeps its fixed size
  // instead of one photo stretching across the whole row.
  const visibleLanes = Math.min(lanes, count)
  // Last index a window can start at so the final photo stays visible. Only the
  // photos beyond what fits are slid through; if everything fits, no sliding.
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
        className={cn('group relative', isVertical && 'h-full')}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {lanes >= 2 ? (
          // Multi-up carousel: a sliding track of equal-size slides (100/lanes
          // %), stepping one photo per click so consecutive windows overlap
          // (1+2+3 → 2+3+4 …). Each slide is its own rounded, bordered card with
          // a gap between visible photos (per-slide padding). Lane count is
          // breakpoint-driven, so sizes are computed in JS.
          //
          // Horizontal: each TILE is a fixed fraction (1/lanes) of a full row,
          // so its size is constant no matter the photo count. When there are
          // fewer photos than lanes the whole strip is narrowed to `visibleLanes`
          // tiles (left-aligned) instead of one photo stretching full-width.
          // Vertical: it fills the parent's height (h-full) and stacks tiles.
          <div
            className={cn(
              'relative overflow-hidden',
              isVertical ? 'h-full w-full' : 'mr-auto'
            )}
            style={
              isVertical
                ? undefined
                : {
                    width: `${(visibleLanes / lanes) * 100}%`,
                    aspectRatio: `${visibleLanes * tileAspect} / 1`,
                  }
            }
          >
            <div
              className={cn(
                'flex transition-transform duration-700 ease-out',
                isVertical ? 'h-full flex-col' : 'h-full'
              )}
              style={{
                // Each tile is 1/visibleLanes of the (already-narrowed)
                // container, so it lands at a fixed 1/lanes of the full row.
                // Slide one tile per step.
                transform: isVertical
                  ? `translateY(-${(index * 100) / visibleLanes}%)`
                  : `translateX(-${(index * 100) / visibleLanes}%)`,
              }}
            >
              {images.map((img, i) => (
                <button
                  key={img.src + i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Enlarge photo ${i + 1} of ${count}`}
                  className={cn(
                    'shrink-0',
                    isVertical ? 'w-full py-1.5' : 'h-full px-1.5'
                  )}
                  style={
                    isVertical
                      ? { height: `${100 / visibleLanes}%` }
                      : { width: `${100 / visibleLanes}%` }
                  }
                >
                  <div className="border-border/60 bg-brand-ink/5 relative h-full w-full overflow-hidden rounded-lg border shadow-sm">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                      loading="lazy"
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
                loading="lazy"
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
              className={cn(
                'border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute z-10 flex size-9 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white',
                isVertical
                  ? 'top-2 left-1/2 -translate-x-1/2'
                  : 'top-1/2 left-2 -translate-y-1/2'
              )}
            >
              {isVertical ? (
                <IconChevronUp className="size-5" stroke={1.75} />
              ) : (
                <IconChevronLeft className="size-5" stroke={1.75} />
              )}
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className={cn(
                'border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute z-10 flex size-9 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white',
                isVertical
                  ? 'bottom-2 left-1/2 -translate-x-1/2'
                  : 'top-1/2 right-2 -translate-y-1/2'
              )}
            >
              {isVertical ? (
                <IconChevronDown className="size-5" stroke={1.75} />
              ) : (
                <IconChevronRight className="size-5" stroke={1.75} />
              )}
            </button>

            {/* Dots: hidden in vertical mode (the column is height-constrained;
                top/bottom arrows are the affordance there). */}
            <div
              className={cn(
                'mt-3 flex justify-center gap-1.5',
                isVertical && 'hidden'
              )}
            >
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
