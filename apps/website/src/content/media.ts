/**
 * Local real photos (curated & compressed from /resource into public/services).
 * Used as the second-choice cover when the backend has no uploaded image yet,
 * before falling back to the Borda logo.
 */

/** slug → local cover image in /public/services. */
export const RESOURCE_COVERS: Record<string, string> = {
  engagement: '/services/engagement/cover.jpg',
  // Use the floral mandap / stage photos for the flagship wedding services
  // (the literal "muhurat board" shots read as signage, so they're avoided).
  'marriage-decoration': '/services/lagan-lekhan/cover.jpg',
  receptions: '/services/lagan-lekhan/g1.jpg',
  'garba-entry': '/services/garba-entry/cover.jpg',
  'baby-shower': '/services/baby-shower/cover.jpg',
  vanarasam: '/services/vanarasam/cover.jpg',
  'room-decoration': '/services/room-decoration/cover.jpg',
}

/**
 * Resolve a card cover with priority: live backend cover → local resource
 * photo → null (logo fallback handled by MediaWithFallback).
 */
export const resolveCover = (
  slug: string,
  backendCovers: Map<string, string>
): string | null => backendCovers.get(slug) ?? RESOURCE_COVERS[slug] ?? null

/**
 * Local image sets per service slug — fallback gallery for the service detail
 * page when the backend has no uploaded media yet (design reference).
 */
export const RESOURCE_GALLERY: Record<string, string[]> = {
  'marriage-decoration': [
    '/services/lagan-lekhan/cover.jpg',
    '/services/lagan-lekhan/g1.jpg',
    '/services/lagan-lekhan/g2.jpg',
    '/services/marriage-decoration/cover.jpg',
    '/services/marriage-decoration/g1.jpg',
    '/services/marriage-decoration/g2.jpg',
  ],
  engagement: [
    '/services/engagement/cover.jpg',
    '/services/engagement/g1.jpg',
    '/services/engagement/g2.jpg',
  ],
  receptions: [
    '/services/lagan-lekhan/g1.jpg',
    '/services/marriage-decoration/g2.jpg',
    '/services/lagan-lekhan/cover.jpg',
  ],
  'garba-entry': [
    '/services/garba-entry/cover.jpg',
    '/services/garba-entry/g1.jpg',
  ],
  'baby-shower': [
    '/services/baby-shower/cover.jpg',
    '/services/baby-shower/g1.jpg',
  ],
  'room-decoration': [
    '/services/room-decoration/cover.jpg',
    '/services/room-decoration/g1.jpg',
  ],
  vanarasam: ['/services/vanarasam/cover.jpg'],
}

/** Curated gallery tiles for the home "Our Work Speaks" masonry preview. */
export const GALLERY_IMAGES: { src: string; label: string }[] = [
  { src: '/services/engagement/cover.jpg', label: 'Engagement' },
  { src: '/services/lagan-lekhan/cover.jpg', label: 'Mandap Décor' },
  { src: '/services/vanarasam/cover.jpg', label: 'Vana Rasam' },
  { src: '/services/baby-shower/cover.jpg', label: 'Baby Shower' },
  { src: '/services/engagement/g2.jpg', label: 'Floral Décor' },
  { src: '/services/garba-entry/cover.jpg', label: 'Garba Entry' },
  { src: '/services/engagement/g1.jpg', label: 'Décor Details' },
  { src: '/services/baby-shower/g1.jpg', label: 'Cradle Ceremony' },
]
