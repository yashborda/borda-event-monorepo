/**
 * Borda Event — marketing service catalogue.
 *
 * Static content that drives the Services grid, home preview, and filters.
 * `slug` targets the matching backend service (see seeds/services-seed.ts) so
 * each card can progressively pull its real cover image from
 * GET /api/website/services by slug. Where no backend equivalent exists yet,
 * the slug simply won't match and the card shows the Borda logo fallback.
 */

export type ServiceCategory =
  | 'Wedding'
  | 'Pre-Wedding'
  | 'Birthday & Party'
  | 'Corporate & Opening'
  | 'Other'

export type ServiceItem = {
  /** Targets the backend service slug for live cover-image lookup. */
  slug: string
  name: string
  category: ServiceCategory
  /** Emoji icon shown on cards. */
  icon: string
  /** One-line description. */
  blurb: string
}

export type FeaturedService = ServiceItem & {
  longDescription: string
  includes: string[]
}

export const SERVICE_FILTERS = [
  'All',
  'Wedding',
  'Pre-Wedding',
  'Birthday & Party',
  'Corporate & Opening',
  'Other',
] as const

export type ServiceFilter = (typeof SERVICE_FILTERS)[number]

export const SERVICES: ServiceItem[] = [
  // ── Wedding ──────────────────────────────────────────────
  {
    slug: 'marriage-decoration',
    name: 'Marriage Decoration',
    category: 'Wedding',
    icon: '💒',
    blurb: 'Grand mandap, stage & venue décor for the big day.',
  },
  {
    slug: 'receptions',
    name: 'Reception Decoration & Entry',
    category: 'Wedding',
    icon: '🥂',
    blurb: 'Elegant reception stages and show-stopping entries.',
  },
  {
    slug: 'engagement',
    name: 'Engagement Decoration',
    category: 'Wedding',
    icon: '💍',
    blurb: 'Romantic ring-ceremony backdrops and seating.',
  },
  {
    slug: 'varmala',
    name: 'Varmala Stage',
    category: 'Wedding',
    icon: '🌸',
    blurb: 'Floral varmala stages for the jaimala moment.',
  },
  {
    slug: 'bride-groom-entry',
    name: 'Bridal & Groom Entry',
    category: 'Wedding',
    icon: '🤵',
    blurb: 'Cinematic couple entries with lights & effects.',
  },
  {
    slug: 'mirror-entry',
    name: 'Mirror Entry',
    category: 'Wedding',
    icon: '🪞',
    blurb: 'Stunning mirror-walkway entries for the couple.',
  },
  {
    slug: 'bridal-doli',
    name: 'Bridal Doli',
    category: 'Wedding',
    icon: '🎎',
    blurb: 'Traditional decorated doli for the vidai.',
  },
  {
    slug: 'room-decoration',
    name: 'Room Decoration',
    category: 'Wedding',
    icon: '🛏️',
    blurb: 'Romantic first-night and suite decorations.',
  },

  // ── Pre-Wedding ──────────────────────────────────────────
  {
    slug: 'haldi-mehndi',
    name: 'Haldi Decoration',
    category: 'Pre-Wedding',
    icon: '🌼',
    blurb: 'Bright marigold haldi setups full of joy.',
  },
  {
    slug: 'mehndi',
    name: 'Mahendi Decoration',
    category: 'Pre-Wedding',
    icon: '🤲',
    blurb: 'Vibrant mehndi-ceremony themes and seating.',
  },
  {
    slug: 'garba-entry',
    name: 'Garba Entry',
    category: 'Pre-Wedding',
    icon: '💃',
    blurb: 'Festive garba & sangeet entries and stage.',
  },
  {
    slug: 'vanarasam',
    name: 'Vana Rasam Decoration',
    category: 'Pre-Wedding',
    icon: '🪔',
    blurb: 'Graceful décor for the vana rasam ritual.',
  },
  {
    slug: 'bride-to-be',
    name: 'Bride to Be',
    category: 'Pre-Wedding',
    icon: '👰',
    blurb: 'Dreamy bride-to-be photo corners and props.',
  },
  {
    slug: 'besna-decoration',
    name: 'Besna Decoration',
    category: 'Pre-Wedding',
    icon: '🛕',
    blurb: 'Traditional besna ceremony decorations.',
  },

  // ── Birthday & Party ─────────────────────────────────────
  {
    slug: 'birthday-celebration',
    name: 'Birthday Decoration',
    category: 'Birthday & Party',
    icon: '🎂',
    blurb: 'Themed birthday setups for all ages.',
  },
  {
    slug: 'baby-shower',
    name: 'Baby Shower Decoration',
    category: 'Birthday & Party',
    icon: '👶',
    blurb: 'Charming baby-shower themes and balloon art.',
  },
  {
    slug: 'chhathi-pujan',
    name: 'Chhaththi Decoration',
    category: 'Birthday & Party',
    icon: '🍼',
    blurb: 'Warm chhaththi ceremony decorations.',
  },
  {
    slug: 'anniversary-decoration',
    name: 'Anniversary Decoration',
    category: 'Birthday & Party',
    icon: '💞',
    blurb: 'Elegant anniversary stages and table décor.',
  },
  {
    slug: 'party-decoration',
    name: 'Party Decoration',
    category: 'Birthday & Party',
    icon: '🎉',
    blurb: 'Stylish setups for every kind of party.',
  },
  {
    slug: 'farewell-party-decoration',
    name: 'Farewell Party Decoration',
    category: 'Birthday & Party',
    icon: '🎓',
    blurb: 'Memorable farewell themes and backdrops.',
  },

  // ── Corporate & Opening ──────────────────────────────────
  {
    slug: 'opening',
    name: 'Opening Decoration',
    category: 'Corporate & Opening',
    icon: '✂️',
    blurb: 'Grand inauguration and store-opening décor.',
  },

  // ── Other ────────────────────────────────────────────────
  {
    slug: 'festival-celebration',
    name: 'Festival Decoration',
    category: 'Other',
    icon: '🪔',
    blurb: 'Festive décor for every occasion and festival.',
  },
  {
    slug: 'dj-orchestra',
    name: 'DJ / Light / LED Screen',
    category: 'Other',
    icon: '🎧',
    blurb: 'DJ, lighting and LED screens for any event.',
  },
  {
    slug: 'photography',
    name: 'Photography',
    category: 'Other',
    icon: '📸',
    blurb: 'Candid and cinematic event photography.',
  },
]

/**
 * Spotlight services on /services with extended copy.
 * Names/slugs mirror the corresponding SERVICES entries.
 */
export const FEATURED_SERVICES: FeaturedService[] = [
  {
    slug: 'marriage-decoration',
    name: 'Marriage Decoration',
    category: 'Wedding',
    icon: '💒',
    blurb: 'Grand mandap, stage & venue décor for the big day.',
    longDescription:
      'From the mandap to the very last table, we craft a wedding that feels entirely yours — opulent florals, layered lighting, and stages built around your story. Our team handles design, setup, and on-day execution so you can simply celebrate.',
    includes: [
      'Custom mandap & stage design',
      'Floral & drapery décor',
      'Entrance & walkway styling',
      'Lighting & ambience setup',
      'On-day setup & supervision',
    ],
  },
  {
    slug: 'receptions',
    name: 'Reception Decoration & Entry',
    category: 'Wedding',
    icon: '🥂',
    blurb: 'Elegant reception stages and show-stopping entries.',
    longDescription:
      'Make your grand reveal unforgettable with a reception stage and entry designed to impress. We blend elegant backdrops, dramatic couple entries, and refined seating into one seamless, photo-ready evening.',
    includes: [
      'Designer reception stage',
      'Couple entry concept & effects',
      'Backdrop & photo-op corners',
      'Guest seating & table styling',
      'Coordinated lighting',
    ],
  },
  {
    slug: 'engagement',
    name: 'Engagement Decoration',
    category: 'Wedding',
    icon: '💍',
    blurb: 'Romantic ring-ceremony backdrops and seating.',
    longDescription:
      'Begin your journey together surrounded by elegance. Our engagement décor pairs romantic backdrops with intimate seating and soft lighting for a ceremony that looks as special as it feels.',
    includes: [
      'Ring-ceremony backdrop',
      'Couch & seating styling',
      'Floral & candle accents',
      'Photo-op & ring platform',
      'Ambient lighting',
    ],
  },
]
