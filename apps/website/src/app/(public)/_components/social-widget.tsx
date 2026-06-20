import { IconBrandInstagram, IconBrandWhatsapp } from '@tabler/icons-react'

import { INSTAGRAM, waLink } from '@/config/site'

/**
 * Fixed floating WhatsApp + Instagram buttons, bottom-right on every public
 * page. WhatsApp opens a pre-filled enquiry; Instagram opens the brand profile.
 */
export const SocialWidget = () => (
  <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3 sm:right-6 sm:bottom-6">
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 sm:size-14"
    >
      <IconBrandWhatsapp className="size-7 sm:size-8" />
    </a>
    <a
      href={INSTAGRAM}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Follow us on Instagram"
      className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-lg transition-transform hover:scale-110 sm:size-14"
    >
      <IconBrandInstagram className="size-7 sm:size-8" />
    </a>
  </div>
)
