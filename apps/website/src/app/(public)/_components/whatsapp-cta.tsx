import { Button } from '@pkg/ui'
import { IconBrandWhatsapp } from '@tabler/icons-react'

import { waLink } from '@/config/site'

type WhatsAppCtaProps = {
  heading?: string
  subtext?: string
  /** Pre-filled WhatsApp message; omit for the generic enquiry. */
  message?: string
}

/** Full-width copper CTA banner reused on the home page and services page. */
export const WhatsAppCta = ({
  heading = 'Ready to Plan Your Dream Event?',
  subtext = "Tell us your date and vision — we'll handle the rest.",
  message,
}: WhatsAppCtaProps) => (
  <section className="bg-brand-copper px-6 py-16 text-white md:py-20">
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
      <h2 className="font-display text-3xl font-bold md:text-4xl">{heading}</h2>
      {subtext && <p className="text-body-lg text-white/85">{subtext}</p>}
      <Button
        asChild
        size="xl"
        className="text-brand-copper hover:bg-brand-cream hover:text-brand-brown bg-white"
      >
        <a href={waLink(message)} target="_blank" rel="noopener noreferrer">
          <IconBrandWhatsapp className="size-5" />
          Chat With Us on WhatsApp
        </a>
      </Button>
    </div>
  </section>
)
