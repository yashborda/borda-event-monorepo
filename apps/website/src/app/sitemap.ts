import type { MetadataRoute } from 'next'

import { getSitemapField } from '@/utils/sitemap.helper'

const sitemap = (): MetadataRoute.Sitemap => {
  return [
    getSitemapField('/', { priority: 1, changeFrequency: 'weekly' }),
    getSitemapField('about', { priority: 0.5, changeFrequency: 'yearly' }),
    getSitemapField('pricing', { priority: 0.5, changeFrequency: 'monthly' }),
    getSitemapField('contact', { priority: 0.4, changeFrequency: 'yearly' }),
    ...['privacy', 'terms'].map((url) =>
      getSitemapField(url, { priority: 0.3, changeFrequency: 'yearly' })
    ),
  ]
}

export default sitemap
