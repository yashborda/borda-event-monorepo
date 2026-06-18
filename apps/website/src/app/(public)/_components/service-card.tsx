import { IconArrowRight } from '@tabler/icons-react'

import Link from 'next/link'

import { MediaWithFallback } from './media-with-fallback'

type ServiceCardProps = {
  /** Minimal shape — works for both static catalogue and live backend services. */
  service: { slug: string; name: string; category?: string }
  /** Resolved cover URL (backend or local resource); null → logo fallback. */
  coverUrl?: string | null
}

/** Tall 4:5 image card linking to the service detail page. */
export const ServiceCard = ({ service, coverUrl }: ServiceCardProps) => (
  <Link
    href={`/services/${service.slug}`}
    className="group border-border/60 relative block aspect-[4/5] overflow-hidden rounded-md border shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
  >
    <MediaWithFallback
      src={coverUrl}
      alt={service.name}
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      className="transition-transform duration-500 group-hover:scale-105"
    />

    {service.category && (
      <span className="bg-brand-copper text-label-sm absolute top-3 left-3 z-10 rounded-md px-2.5 py-1 font-semibold text-white">
        {service.category}
      </span>
    )}

    <div className="from-brand-ink/90 via-brand-ink/30 absolute inset-x-0 bottom-0 z-10 bg-linear-to-t to-transparent p-4 pt-12">
      <h3 className="font-display text-lg leading-snug font-semibold text-white">
        {service.name}
      </h3>
      <span className="text-brand-cream mt-1 inline-flex translate-y-1 items-center gap-1 text-sm font-medium opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        View Details <IconArrowRight className="size-4" />
      </span>
    </div>
  </Link>
)
