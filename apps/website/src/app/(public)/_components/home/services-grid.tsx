import { Button } from '@pkg/ui'
import { IconArrowRight } from '@tabler/icons-react'

import Link from 'next/link'

import { getServiceIcon } from '@/content/service-icons'
import { SERVICES } from '@/content/services'

import { SectionHeading } from '../section-heading'

// Curated, diverse preview for the home page — the full list lives on /services.
const HOME_PREVIEW_SLUGS = [
  'marriage-decoration',
  'engagement',
  'haldi-mehndi',
  'garba-entry',
  'baby-shower',
  'birthday-celebration',
  'receptions',
  'varmala',
  'opening',
]
const PREVIEW_SERVICES = HOME_PREVIEW_SLUGS.map((slug) =>
  SERVICES.find((s) => s.slug === slug)
).filter((s): s is (typeof SERVICES)[number] => Boolean(s))

/** Home "What We Do" — curated preview of services. */
export const HomeServices = () => (
  <section id="services" className="px-6 py-16 md:py-24">
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        label="Our Services"
        title="We Create Every Celebration"
        description="From intimate ceremonies to grand weddings, every Borda Event setup is designed around your story."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PREVIEW_SERVICES.map((service) => {
          const Icon = getServiceIcon(service.slug)
          return (
            <div
              key={service.name}
              className="group bg-card border-border/60 hover:border-brand-copper hover:ring-brand-copper rounded-md border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-1"
            >
              <span className="bg-brand-copper/10 text-brand-copper group-hover:bg-brand-copper inline-flex size-12 items-center justify-center rounded-md transition-colors group-hover:text-white">
                <Icon className="size-6" stroke={1.5} />
              </span>
              <h3 className="text-brand-ink font-display mt-4 text-lg font-semibold">
                {service.name}
              </h3>
              <p className="text-muted-foreground text-body-md mt-1">
                {service.blurb}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild size="lg" variant="outline-accent">
          <Link href="/services">
            View All Services
            <IconArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
)
