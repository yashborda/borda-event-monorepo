import type { MetadataRoute } from 'next'

// import { getSitemapField } from '@/utils/sitemap.helper'

export default function sitemap(): MetadataRoute.Sitemap {
  // Return empty [] because
  return []

  // return [
  //   getSitemapField('/', {
  //     priority: 1,
  //     changeFrequency: 'weekly',
  //   }),

  // ...['about-us', 'support', 'privacy-policy', 'terms-and-conditions'].map(
  //   (url) =>
  //     getSitemapField(url, {
  //       priority: 0.3,
  //       changeFrequency: 'yearly',
  //     })
  // ),
  // ]
}
