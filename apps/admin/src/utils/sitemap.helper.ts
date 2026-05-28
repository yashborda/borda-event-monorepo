import { MetadataRoute } from 'next'

import { getAbsoluteUrl } from '@/utils/absolute-url.helper'

/**
 * Generates a sitemap field for a given path
 */
export const getSitemapField = (
  path: string,
  options: Partial<Omit<MetadataRoute.Sitemap[number], 'url'>> = {}
): MetadataRoute.Sitemap[number] => ({
  url: getAbsoluteUrl(path)!,
  lastModified: new Date().toISOString(),
  changeFrequency: 'weekly',
  priority: 0.7,
  ...options,
})
