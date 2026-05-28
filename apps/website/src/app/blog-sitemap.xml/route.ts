import { trimEnd } from 'lodash'

import { env } from '@/env'

import {
  getAllAuthorSlugs,
  getAllBlogSlugs,
  getAllCategorySlugs,
  getAllTagSlugs,
} from '@/lib/blog-api'

export const revalidate = 3600

const siteUrl = trimEnd(env.NEXT_PUBLIC_SITE_URL, '/')

type SitemapEntry = {
  url: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

const buildXml = (entries: SitemapEntry[]): string => {
  const urls = entries
    .map(
      ({ url, lastmod, changefreq, priority }) => `
  <url>
    <loc>${url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority !== undefined ? `<priority>${priority}</priority>` : ''}
  </url>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`
}

export const GET = async () => {
  const now = new Date().toISOString()

  const [blogSlugs, categorySlugs, authorSlugs, tagSlugs] = await Promise.all([
    getAllBlogSlugs().catch(() => []),
    getAllCategorySlugs().catch(() => []),
    getAllAuthorSlugs().catch(() => []),
    getAllTagSlugs().catch(() => []),
  ])

  const entries: SitemapEntry[] = [
    {
      url: `${siteUrl}/blog`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.8,
    },
    ...blogSlugs.map(({ slug }) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.7,
    })),
    ...categorySlugs.map(({ slug }) => ({
      url: `${siteUrl}/blog/category/${slug}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.6,
    })),
    ...authorSlugs.map(({ slug }) => ({
      url: `${siteUrl}/blog/author/${slug}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.5,
    })),
    ...tagSlugs.map(({ slug }) => ({
      url: `${siteUrl}/blog/tag/${slug}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.5,
    })),
  ]

  return new Response(buildXml(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`,
    },
  })
}
