import type { IServiceDetail, IServiceThemeVideo } from '@pkg/types'
import { Button, cn } from '@pkg/ui'
import {
  IconBrandWhatsapp,
  IconCheck,
  IconChevronRight,
  IconPhone,
} from '@tabler/icons-react'

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getServiceBySlug, getServiceSlugs } from '@/lib/services-api'

import { getPageSeoMetadata } from '@/utils/seo.helper'

import { TEL, serviceEnquiry } from '@/config/site'
import { RESOURCE_COVERS, RESOURCE_GALLERY } from '@/content/media'
import { FEATURED_SERVICES, SERVICES } from '@/content/services'

import { WhatsAppCta } from '../../_components/whatsapp-cta'
import { type GalleryImage, PhotoSlider } from './_components/photo-slider'
import { ThemeVideos } from './_components/theme-videos'

type Props = { params: Promise<{ slug: string }> }

type ThemeSection = {
  key: string
  title: string | null
  description: string | null
  images: GalleryImage[]
  videos: IServiceThemeVideo[]
}

export const generateStaticParams = async () => {
  const backend = await getServiceSlugs()
  const slugs = new Set<string>([...SERVICES.map((s) => s.slug), ...backend])
  return Array.from(slugs).map((slug) => ({ slug }))
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params
  const detail = await getServiceBySlug(slug)
  const staticSvc = SERVICES.find((s) => s.slug === slug)
  const name = detail?.name ?? staticSvc?.name ?? 'Service'
  return getPageSeoMetadata({
    canonical: `/services/${slug}`,
    title: `${name} | Borda Event`,
    description: detail?.description ?? staticSvc?.blurb ?? undefined,
    ogImageUrl: detail?.coverImage?.url ?? RESOURCE_COVERS[slug] ?? undefined,
  })
}

/** Build the theme sections: backend themes → service media → local fallback. */
const buildSections = (
  detail: IServiceDetail | null,
  slug: string,
  name: string
): ThemeSection[] => {
  if (detail?.themes?.length) {
    return detail.themes
      .map((theme) => ({
        key: theme.id,
        title: theme.name,
        description: theme.description,
        images: [...theme.media]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((m) => ({ src: m.url, alt: `${name} — ${theme.name}` })),
        videos: theme.videos ?? [],
      }))
      .filter((s) => s.images.length > 0 || s.videos.length > 0)
  }

  if (detail?.media?.length) {
    return [
      {
        key: 'gallery',
        title: null,
        description: null,
        images: [...detail.media]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((m) => ({ src: m.url, alt: name })),
        videos: [],
      },
    ]
  }

  const local = RESOURCE_GALLERY[slug]
  if (local?.length) {
    return [
      {
        key: 'gallery',
        title: null,
        description: null,
        images: local.map((src) => ({ src, alt: name })),
        videos: [],
      },
    ]
  }

  return []
}

const ServiceDetailPage = async ({ params }: Props) => {
  const { slug } = await params
  const detail = await getServiceBySlug(slug)
  const staticSvc = SERVICES.find((s) => s.slug === slug)
  const featured = FEATURED_SERVICES.find((s) => s.slug === slug)

  if (!detail && !staticSvc) notFound()

  const name = detail?.name ?? staticSvc?.name ?? slug
  const category = staticSvc?.category
  const description =
    detail?.description ?? featured?.longDescription ?? staticSvc?.blurb ?? null
  const includes = featured?.includes ?? []
  const heroCover =
    detail?.coverImage?.url ??
    RESOURCE_COVERS[slug] ??
    RESOURCE_GALLERY[slug]?.[0] ??
    null

  const sections = buildSections(detail, slug, name)

  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[55vh] items-end overflow-hidden">
        {heroCover ? (
          <Image
            src={heroCover}
            alt={name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="bg-brand-brown absolute inset-0" />
        )}
        <div className="from-brand-ink/92 via-brand-ink/55 absolute inset-0 bg-linear-to-t to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-white/70"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <IconChevronRight className="size-4" />
            <Link href="/services" className="hover:text-white">
              Services
            </Link>
            <IconChevronRight className="size-4" />
            <span className="text-white">{name}</span>
          </nav>

          {category && (
            <span className="bg-brand-copper text-label-sm mt-4 inline-block rounded-md px-2.5 py-1 font-semibold text-white">
              {category}
            </span>
          )}
          <h1 className="font-display mt-3 text-4xl font-bold text-white md:text-5xl">
            {name}
          </h1>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-brand-copper hover:bg-brand-copper/85 text-white"
            >
              <a
                href={serviceEnquiry(name)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandWhatsapp className="size-5" />
                Enquire on WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="text-brand-brown hover:bg-brand-cream bg-white"
            >
              <a href={TEL}>
                <IconPhone className="size-5" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Description + what's included */}
      {(description || includes.length > 0) && (
        <section className="px-6 py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
            {description && (
              <div className="md:col-span-2">
                <span className="text-label-md text-brand-copper font-semibold">
                  About this service
                </span>
                <p className="text-muted-foreground text-body-lg mt-3">
                  {description}
                </p>
              </div>
            )}
            {includes.length > 0 && (
              <div className="bg-muted/40 border-border/60 rounded-md border p-6">
                <h2 className="text-brand-ink font-display text-lg font-semibold">
                  What&apos;s included
                </h2>
                <ul className="mt-4 space-y-2">
                  {includes.map((item) => (
                    <li
                      key={item}
                      className="text-brand-ink text-body-md flex items-center gap-2"
                    >
                      <IconCheck className="text-brand-copper size-4 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Theme sections: cover + extra images + videos */}
      {sections.length > 0 && (
        <section className="bg-muted/30 px-6 py-14 md:py-20">
          <div className="mx-auto max-w-6xl space-y-14">
            {sections.map((section, i) => {
              const hasPhotos = section.images.length > 0
              const hasVideos = section.videos.length > 0
              // With a video we pair a single-photo slider beside it in a
              // two-column row. With photos only we keep one slider that shows
              // two photos at a time (stepping one at a time), so the layout
              // stays balanced without ballooning into one oversized card.
              const photosOnlyTwoUp = hasPhotos && !hasVideos
              const split = hasPhotos && hasVideos
              return (
                <div key={section.key}>
                  <h2 className="text-brand-ink font-display text-2xl font-bold md:text-3xl">
                    {section.title ?? (i === 0 ? 'Gallery' : `Theme ${i + 1}`)}
                  </h2>
                  {section.description && (
                    <p className="text-muted-foreground text-body-md mt-2 max-w-2xl">
                      {section.description}
                    </p>
                  )}

                  {/* With a video: single-photo slider left, video(s) right,
                      side by side. Without a video: one slider showing two
                      photos at a time so the row stays balanced. */}
                  <div
                    className={cn(
                      'mt-6 grid items-start gap-4 sm:gap-6',
                      split && 'grid-cols-2'
                    )}
                  >
                    {hasPhotos && (
                      <div>
                        <PhotoSlider
                          images={section.images}
                          perView={photosOnlyTwoUp ? 2 : 1}
                        />
                      </div>
                    )}
                    {hasVideos && (
                      <div>
                        <ThemeVideos videos={section.videos} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <WhatsAppCta
        heading={`Planning ${name}?`}
        message={`Hello Borda Event, I'm interested in ${name}`}
      />
    </main>
  )
}

export default ServiceDetailPage
