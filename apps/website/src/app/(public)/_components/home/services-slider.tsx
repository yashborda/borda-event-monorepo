'use client'

import { cn } from '@pkg/ui'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

import Link from 'next/link'

import * as React from 'react'

import { MediaWithFallback } from '../media-with-fallback'

export type ServiceSlide = {
  slug: string
  name: string
  /** Resolved cover URL (backend → local resource); null → logo fallback. */
  coverUrl: string | null
}

type ServicesSliderProps = {
  slides: ServiceSlide[]
}

/** Card shown for a single service (used in both mobile pages and desktop cards). */
const ServiceCard = ({ slide }: { slide: ServiceSlide }) => (
  <Link
    href={`/services/${slide.slug}`}
    className="group border-border/60 relative block aspect-3/4 overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    <MediaWithFallback
      src={slide.coverUrl}
      alt={slide.name}
      sizes="(max-width: 640px) 44vw, (max-width: 1024px) 46vw, 32vw"
      className="transition-transform duration-500 group-hover:scale-105"
    />
    <div className="from-brand-ink/85 via-brand-ink/25 absolute inset-x-0 bottom-0 z-10 bg-linear-to-t to-transparent p-3 pt-12 sm:p-5 sm:pt-16">
      <h3 className="font-display text-base leading-snug font-semibold text-white sm:text-xl">
        {slide.name}
      </h3>
    </div>
  </Link>
)

// Group size per swipe-page on mobile: a 2×2 grid shows 4 services at once.
const MOBILE_PAGE_SIZE = 4
const SM = 640
// How long each page stays before auto-advancing.
const AUTOPLAY_MS = 4000

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Dependency-free image carousel for the home "Our Services" section.
 * Uses native scroll-snap for smooth touch/trackpad swiping; the copper
 * arrows scroll one page at a time and the dots track the active page.
 *
 * Mobile: each swipe-page is a 2×2 grid of 4 services (scroll for the next 4).
 * Desktop (sm+): one service card per snap slide, as before.
 * Themed entirely with Borda brand tokens.
 */
export const ServicesSlider = ({ slides }: ServicesSliderProps) => {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const slideRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = React.useState(0)
  // Autoplay pauses while the visitor is interacting (hover / touch).
  const [paused, setPaused] = React.useState(false)
  // Layout switches at SM: mobile paginates into 2×2 pages; desktop is per-card.
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < SM)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // The snap units: pages of 4 on mobile, individual services on desktop.
  const pages = React.useMemo(
    () => (isMobile ? chunk(slides, MOBILE_PAGE_SIZE) : slides.map((s) => [s])),
    [isMobile, slides]
  )

  // Track which page is in view for the dot indicators. Re-runs when the page
  // count changes (i.e. when the mobile/desktop layout flips).
  React.useEffect(() => {
    const track = trackRef.current
    if (!track) return
    setActive(0)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = slideRefs.current.indexOf(
              entry.target as HTMLDivElement
            )
            if (index !== -1) setActive(index)
          }
        }
      },
      { root: track, threshold: 0.6 }
    )
    for (const el of slideRefs.current.slice(0, pages.length)) {
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [pages.length])

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, pages.length - 1))
    slideRefs.current[clamped]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }

  // Autoplay: advance one page every AUTOPLAY_MS, looping back to the first
  // after the last. Paused on hover/touch and skipped when there's one page.
  React.useEffect(() => {
    if (paused || pages.length <= 1) return
    const id = setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % pages.length
        slideRefs.current[next]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        })
        return next
      })
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, pages.length])

  if (slides.length === 0) return null

  return (
    <div
      className="relative mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      {/* Arrows — hidden on touch-first small screens where swipe is natural */}
      <button
        type="button"
        aria-label="Previous services"
        onClick={() => scrollToIndex(active - 1)}
        className="border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute top-1/2 -left-3 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white md:flex lg:-left-5"
      >
        <IconChevronLeft className="size-6" stroke={1.75} />
      </button>
      <button
        type="button"
        aria-label="Next services"
        onClick={() => scrollToIndex(active + 1)}
        className="border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute top-1/2 -right-3 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white md:flex lg:-right-5"
      >
        <IconChevronRight className="size-6" stroke={1.75} />
      </button>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page, i) => (
          <div
            key={page.map((s) => s.slug).join('|')}
            ref={(el) => {
              slideRefs.current[i] = el
            }}
            // Mobile: a full-width snap page laying its (up to) 4 services in a
            // 2×2 grid. Desktop: a single service card, ~half/third width.
            className={cn(
              'shrink-0 snap-start',
              isMobile
                ? 'grid w-full grid-cols-2 gap-3'
                : 'w-[46%] lg:w-[31.5%]'
            )}
          >
            {page.map((slide) => (
              <ServiceCard key={slide.slug} slide={slide} />
            ))}
          </div>
        ))}
      </div>

      {/* Dot indicators — one per page */}
      <div className="mt-6 flex justify-center gap-2">
        {pages.map((page, i) => (
          <button
            key={page.map((s) => s.slug).join('|')}
            type="button"
            aria-label={`Go to page ${i + 1}`}
            aria-current={i === active}
            onClick={() => scrollToIndex(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === active
                ? 'bg-brand-copper w-6'
                : 'bg-brand-copper/30 hover:bg-brand-copper/60 w-2'
            )}
          />
        ))}
      </div>
    </div>
  )
}
