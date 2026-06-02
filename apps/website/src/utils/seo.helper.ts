import { trimEnd } from 'lodash'

import { Metadata } from 'next'

import { env } from '@/env'

import brandBanner from '@/assets/images/banner.png'

type PageSeoInput = {
  canonical: string
  title: string
  description?: string | null
  keywords?: string | null
  ogType?: 'article' | 'website'
  ogTitle?: string | null
  ogDescription?: string | null
  ogImageUrl?: string | null
  twitterTitle?: string | null
  twitterDescription?: string | null
  twitterImageUrl?: string | null
  robots?: string | null
  googlebot?: string | null
}

const siteUrl = trimEnd(env.NEXT_PUBLIC_SITE_URL, '/')

const defaultOgImage = {
  url: brandBanner.src,
  width: 1200,
  height: 630,
}

export const defaultMetadata: Metadata = {
  title: 'Borda Event — Decoration & Management',
  description:
    'Luxury wedding and event decoration & management in Surat, Gujarat. Planning for an event — elegant, royal, and unforgettable celebrations.',
  keywords:
    'event decoration, wedding decoration, event management, wedding planner, luxury weddings, Surat, Gujarat, Borda Event, bordaevent.com',
  openGraph: {
    title: 'Borda Event — Decoration & Management',
    description:
      'Luxury wedding and event decoration & management in Surat, Gujarat. Planning for an event — elegant, royal, and unforgettable celebrations.',
    url: siteUrl,
    type: 'website',
    images: defaultOgImage,
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@bordaevent',
    title: 'Borda Event — Decoration & Management',
    description:
      'Luxury wedding and event decoration & management in Surat, Gujarat. Planning for an event — elegant, royal, and unforgettable celebrations.',
    images: defaultOgImage,
  },
  alternates: {
    canonical: siteUrl,
  },
  metadataBase: siteUrl,
}

export const getMetadata = (meta: Metadata): Metadata => ({
  ...defaultMetadata,
  ...meta,
  openGraph: {
    ...defaultMetadata.openGraph,
    ...meta.openGraph,
  },
  twitter: {
    ...defaultMetadata.twitter,
    ...meta.twitter,
  },
  alternates: {
    ...defaultMetadata.alternates,
    ...meta.alternates,
  },
})

export const getPageSeoMetadata = ({
  canonical,
  title,
  description,
  keywords,
  ogType = 'website',
  ogTitle,
  ogDescription,
  ogImageUrl,
  twitterTitle,
  twitterDescription,
  twitterImageUrl,
  robots,
  googlebot,
}: PageSeoInput): Metadata =>
  getMetadata({
    title,
    description: description || undefined,
    keywords: keywords || undefined,
    alternates: { canonical },
    openGraph: {
      title: ogTitle || title,
      description: ogDescription || description || undefined,
      type: ogType,
      url: canonical,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle || ogTitle || title,
      description:
        twitterDescription || ogDescription || description || undefined,
      ...(twitterImageUrl || ogImageUrl
        ? { images: [(twitterImageUrl || ogImageUrl) as string] }
        : {}),
    },
    robots: {
      index: robots !== 'noindex',
      googleBot: { index: googlebot !== 'noindex' },
    },
  })
