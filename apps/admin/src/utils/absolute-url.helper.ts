import { trimEnd, trimStart } from 'lodash'

import { env } from '@/env'

const trimmedSiteUrl = trimStart(trimEnd(env.NEXT_PUBLIC_SITE_URL, ' /'), '/')

/**
 * Ensures a URL is absolute. If it starts with http/https, returns as is. Otherwise, prefixes with the site URL.
 * @param url The URL to check
 * @returns Absolute URL
 */
export const getAbsoluteUrl = (url?: string): string | undefined => {
  if (!url) return
  if (/^https?:\/\//i.test(url)) return url
  // Ensure no double slashes
  return trimEnd(`${trimmedSiteUrl}/${trimStart(url, '/')}`, '/')
}
