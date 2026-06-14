import { Button, cn } from '@pkg/ui'
import { IconBrandWhatsapp, IconCheck } from '@tabler/icons-react'

import { serviceEnquiry } from '@/config/site'
import { FEATURED_SERVICES } from '@/content/services'

import { MediaWithFallback } from '../../_components/media-with-fallback'

type ServiceSpotlightProps = {
  covers: Record<string, string | null>
}

/** Feature spotlight for the top services — image left, details right. */
export const ServiceSpotlight = ({ covers }: ServiceSpotlightProps) => (
  <div className="space-y-14 md:space-y-20">
    {FEATURED_SERVICES.map((service, i) => (
      <div
        key={service.slug}
        className="grid items-center gap-8 md:grid-cols-2"
      >
        <div
          className={cn(
            'border-border/60 relative aspect-[4/3] overflow-hidden rounded-md border shadow-sm',
            i % 2 === 1 && 'md:order-last'
          )}
        >
          <MediaWithFallback
            src={covers[service.slug]}
            alt={service.name}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div>
          <span className="text-label-md text-brand-copper font-semibold">
            {service.category}
          </span>
          <h3 className="text-brand-ink font-display mt-1 text-2xl font-bold md:text-3xl">
            {service.name}
          </h3>
          <p className="text-muted-foreground text-body-lg mt-3">
            {service.longDescription}
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {service.includes.map((item) => (
              <li
                key={item}
                className="text-brand-ink text-body-md flex items-center gap-2"
              >
                <IconCheck className="text-brand-copper size-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-6">
            <a
              href={serviceEnquiry(service.name)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandWhatsapp className="size-5" />
              Enquire on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    ))}
  </div>
)
