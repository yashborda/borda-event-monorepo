'use client'

import { cn } from '@pkg/ui'

import * as React from 'react'

import {
  SERVICES,
  SERVICE_FILTERS,
  type ServiceFilter,
} from '@/content/services'

import { ServiceCard } from '../../_components/service-card'

type ServicesFilterGridProps = {
  /** slug → resolved cover URL (null = logo fallback). */
  covers: Record<string, string | null>
}

export const ServicesFilterGrid = ({ covers }: ServicesFilterGridProps) => {
  const [active, setActive] = React.useState<ServiceFilter>('All')

  const filtered =
    active === 'All'
      ? SERVICES
      : SERVICES.filter((service) => service.category === active)

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 md:justify-start">
        {SERVICE_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              active === filter
                ? 'bg-brand-copper text-white'
                : 'bg-muted text-brand-ink hover:bg-brand-copper/10'
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((service) => (
          <ServiceCard
            key={service.name}
            service={service}
            coverUrl={covers[service.slug]}
          />
        ))}
      </div>
    </div>
  )
}
