import { ServiceCard } from '../../_components/service-card'

export type ServiceGridItem = {
  slug: string
  name: string
  coverUrl: string | null
}

type ServicesGridProps = {
  services: ServiceGridItem[]
}

/** Plain responsive grid of every active service (backend-driven). */
export const ServicesGrid = ({ services }: ServicesGridProps) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
    {services.map((service) => (
      <ServiceCard
        key={service.slug}
        service={service}
        coverUrl={service.coverUrl}
      />
    ))}
  </div>
)
