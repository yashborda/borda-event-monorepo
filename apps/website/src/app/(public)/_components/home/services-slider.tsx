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

/**
 * Dependency-free image carousel for the home "Our Services" section.
 * Uses native scroll-snap for smooth touch/trackpad swiping; the copper
 * arrows scroll one card at a time and the dots track the active slide.
 * Themed entirely with Borda brand tokens.
 */
export const ServicesSlider = ({ slides }: ServicesSliderProps) => {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const slideRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = React.useState(0)

  // Track which slide is centred in the viewport for the dot indicators.
  React.useEffect(() => {
    const track = trackRef.current
    if (!track) return
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
    for (const el of slideRefs.current) if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [slides.length])

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1))
    slideRefs.current[clamped]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }

  if (slides.length === 0) return null

  return (
    <div className="relative mt-10">
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
        {slides.map((slide, i) => (
          <div
            key={slide.slug}
            ref={(el) => {
              slideRefs.current[i] = el
            }}
            className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]"
          >
            <Link
              href={`/services/${slide.slug}`}
              className="group border-border/60 relative block aspect-[3/4] overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <MediaWithFallback
                src={slide.coverUrl}
                alt={slide.name}
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 32vw"
                className="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="from-brand-ink/85 via-brand-ink/25 absolute inset-x-0 bottom-0 z-10 bg-linear-to-t to-transparent p-5 pt-16">
                <h3 className="font-display text-xl leading-snug font-semibold text-white">
                  {slide.name}
                </h3>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.slug}
            type="button"
            aria-label={`Go to ${slide.name}`}
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
