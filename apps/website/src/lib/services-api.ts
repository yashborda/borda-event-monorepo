import type { IService, IServiceDetail } from '@pkg/types'

const BACKEND_URL =
  process.env['BACKEND_INTERNAL_URL'] ?? 'http://localhost:3002'

/**
 * Public list of active services (with cover images), used to progressively
 * enhance the static marketing cards with real photos. Returns [] on any
 * failure so the site renders fine with the backend down.
 */
export const getServices = async (): Promise<IService[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/website/services`, {
      next: { revalidate: 86400, tags: ['services'] },
    })
    if (!res.ok) return []
    return (await res.json()) as IService[]
  } catch {
    return []
  }
}

/**
 * Build a slug → cover-image-url map from the live services list.
 * Cards look up their image by the slug defined in content/services.ts.
 */
export const getServiceCoverMap = async (): Promise<Map<string, string>> => {
  const services = await getServices()
  const map = new Map<string, string>()
  for (const service of services) {
    if (service.coverImage?.url) {
      map.set(service.slug, service.coverImage.url)
    }
  }
  return map
}

/** Full service detail (description, service-level media, themes with media + videos). */
export const getServiceBySlug = async (
  slug: string
): Promise<IServiceDetail | null> => {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/website/services/${encodeURIComponent(slug)}`,
      { next: { revalidate: 86400, tags: [`service-${slug}`, 'services'] } }
    )
    if (!res.ok) return null
    return (await res.json()) as IServiceDetail
  } catch {
    return null
  }
}

/** Active service slugs for static generation. Returns [] on failure. */
export const getServiceSlugs = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/website/services/slugs`, {
      next: { revalidate: 86400, tags: ['services'] },
    })
    if (!res.ok) return []
    const data = (await res.json()) as unknown
    if (!Array.isArray(data)) return []
    // Tolerate either ["slug", ...] or [{ slug }, ...]
    return data
      .map((d) => (typeof d === 'string' ? d : (d as { slug?: string }).slug))
      .filter((s): s is string => Boolean(s))
  } catch {
    return []
  }
}
