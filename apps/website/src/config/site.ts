/**
 * Borda Event — brand & contact constants.
 * Single source of truth for every CTA, phone, and social link on the
 * public marketing site.
 */

export const BRAND_NAME = 'Borda Event'
export const TAGLINE = 'Your Celebration, Our Creation'
export const OWNER_NAME = 'Nikunj Borda'
export const LOCATION = 'Surat, Gujarat'
/** Google Maps link to the Borda Event location. */
export const MAPS_URL = 'https://maps.app.goo.gl/Lb75a1bL7YLsdSEr5'

/** Display phone (human readable). */
export const PHONE = '+91 84690 60825'
/** Digits-only, used for wa.me + tel links. */
const PHONE_DIGITS = '918469060825'

export const TEL = `tel:+${PHONE_DIGITS}`

/** Build a WhatsApp deep link with a pre-filled message. */
export const waLink = (
  message = `Hello ${BRAND_NAME}, I'm interested in your services`
): string => `https://wa.me/${PHONE_DIGITS}?text=${encodeURIComponent(message)}`

/** Pre-filled enquiry message for a specific service. */
export const serviceEnquiry = (serviceName: string): string =>
  waLink(`Hello ${BRAND_NAME}, I'm interested in ${serviceName} decoration`)

export const INSTAGRAM = 'https://instagram.com/event.borda'
export const FACEBOOK = 'https://facebook.com/event.borda'
export const SOCIAL_HANDLE = 'event.borda'

/** Headline stats shown across the site (hero pills + dark stats band). */
export const STATS = [
  { value: 300, suffix: '+', label: 'Events Completed' },
  { value: 250, suffix: '+', label: 'Happy Clients' },
  { value: 24, suffix: '+', label: 'Service Types' },
  { value: 3, suffix: '+', label: 'Years Experience' },
] as const
