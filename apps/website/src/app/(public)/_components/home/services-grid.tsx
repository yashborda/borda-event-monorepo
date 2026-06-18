import { Button } from '@pkg/ui'
import { IconArrowRight } from '@tabler/icons-react'

import Link from 'next/link'

import { getServices } from '@/lib/services-api'

import { RESOURCE_COVERS } from '@/content/media'
import { SERVICES } from '@/content/services'

import { SectionHeading } from '../section-heading'
import { type ServiceSlide, ServicesSlider } from './services-slider'

/**
 * Build the home slider from live, active backend services (admin sort order),
 * resolving each cover: backend image → local resource photo → logo fallback.
 * If the backend is unreachable, fall back to the static marketing catalogue
 * so the section always renders.
 */
const buildSlides = async (): Promise<ServiceSlide[]> => {
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
    coverUrl: RESOURCE_COVERS[s.slug] ?? null,
  }))
}

/** Home "Our Services" — dynamic image carousel of every active service. */
export const HomeServices = async () => {
  const slides = await buildSlides()

  return (
    <section id="services" className="overflow-hidden px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          label="Our Services"
          title="We Create Every Celebration"
          description="From intimate ceremonies to grand weddings, every Borda Event setup is designed around your story."
        />

        <ServicesSlider slides={slides} />

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
}
