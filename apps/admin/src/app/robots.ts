import { trim } from 'lodash'

import { MetadataRoute } from 'next'

import { env } from '@/env'

// import { generateSitemaps } from '@/app/sitemaps/sitemap'

const siteUrl = trim(env.NEXT_PUBLIC_SITE_URL, '/')

const getSitemapUrls = async () => {
  // const sitemaps = await generateSitemaps()
  return [
    `${siteUrl}/sitemap.xml`,
    // ...sitemaps.map(
    //   (sitemap) => `${siteUrl}/sitemaps/sitemap/${sitemap.id}.xml`
    // ),
  ]
}

const rules =
  env.NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? [
        {
          userAgent: '*',
          disallow: '/',
        },
        //
        // {
        //   userAgent: '*',
        //   allow: '/',
        //   disallow: ['/api/', '/_next/', '/_static/', '/uploads/'],
        //   crawlDelay: 1, // Slow down even Google
        // },
      ]
    : {
        userAgent: '*',
        disallow: '/',
      }

export default async function robots(): Promise<MetadataRoute.Robots> {
  const sitemap = await getSitemapUrls()

  return {
    rules,
    sitemap,
  }
}
