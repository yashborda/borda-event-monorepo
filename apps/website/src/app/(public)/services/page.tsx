import { IconChevronRight } from '@tabler/icons-react'

import type { Metadata } from 'next'
import Link from 'next/link'

import { getServiceCoverMap, getServices } from '@/lib/services-api'

import { getPageSeoMetadata } from '@/utils/seo.helper'

import { RESOURCE_COVERS, resolveCover } from '@/content/media'
import { FEATURED_SERVICES, SERVICES } from '@/content/services'

import { SectionHeading } from '../_components/section-heading'
import { WhatsAppCta } from '../_components/whatsapp-cta'
import { ServiceSpotlight } from './_components/service-spotlight'
import { type ServiceGridItem, ServicesGrid } from './_components/services-grid'

export const metadata: Metadata = getPageSeoMetadata({
  canonical: '/services',
  title: 'All Our Services | Borda Event',
  description:
    'From intimate gatherings to grand weddings — explore every decoration & event-management service Borda Event offers in Surat, Gujarat.',
})

/**
 * Live, active services (admin sort order) with resolved covers. Falls back to
 * the static catalogue if the backend is unreachable so the page always fills.
 */
const buildServices = async (
  backendCovers: Map<string, string>
): Promise<ServiceGridItem[]> => {
  const services = await getServices()
  if (services.length) {
    return services.map((s) => ({
      slug: s.slug,
      name: s.name,
      coverUrl: s.coverImage?.url ?? RESOURCE_COVERS[s.slug] ?? null,
    }))
  }
  return SERVICES.map((s) => ({
    slug: s.slug,
    name: s.name,
    coverUrl: resolveCover(s.slug, backendCovers),
  }))
}

const ServicesPage = async () => {
  const backendCovers = await getServiceCoverMap()
  const services = await buildServices(backendCovers)

  // Spotlight covers for the curated featured services.
  const covers: Record<string, string | null> = {}
  for (const service of FEATURED_SERVICES) {
    covers[service.slug] = resolveCover(service.slug, backendCovers)
  }

  return (
    <main>
      {/* Hero + breadcrumb */}
      <section className="bg-brand-brown px-6 py-16 text-center text-white md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            All Our Services
          </h1>
          <p className="text-body-lg mt-3 text-white/85">
            From intimate gatherings to grand weddings — we do it all in Surat.
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-5 flex items-center justify-center gap-1 text-sm text-white/70"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <IconChevronRight className="size-4" />
            <span className="text-white">Services</span>
          </nav>
        </div>
      </section>

      {/* All services grid */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <ServicesGrid services={services} />
        </div>
      </section>

      {/* Spotlight */}
      <section className="bg-muted/40 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            align="center"
            label="Featured"
            title="Our Signature Setups"
            className="mb-12"
          />
          <ServiceSpotlight covers={covers} />
        </div>
      </section>

      <WhatsAppCta />
    </main>
  )
}

export default ServicesPage
