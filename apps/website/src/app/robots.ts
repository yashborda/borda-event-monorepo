import { trim } from 'lodash'

import type { MetadataRoute } from 'next'

import { env } from '@/env'

const siteUrl = trim(env.NEXT_PUBLIC_SITE_URL, '/')

const getSitemapUrls = () => [
  `${siteUrl}/sitemap.xml`,
  `${siteUrl}/blog-sitemap.xml`,
]

const rules =
  env.NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/', '/_next/', '/_static/', '/uploads/'],
          crawlDelay: 1, // Slow down even Google
        },
      ]
    : {
        userAgent: '*',
        disallow: '/',
      }

const robots = (): MetadataRoute.Robots => {
  const sitemap = getSitemapUrls()

  return {
    rules,
    sitemap,
  }
}

export default robots
