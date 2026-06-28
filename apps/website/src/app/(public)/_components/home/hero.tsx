import { Button } from '@pkg/ui'
import { IconBrandWhatsapp, IconPhone } from '@tabler/icons-react'

import Image from 'next/image'

import { TAGLINE, TEL, waLink } from '@/config/site'

const HERO_PILLS = [
  { value: '300+', label: 'Events' },
  { value: '', label: 'Happy Clients' },
  { value: '3+', label: 'Years' },
]

export const Hero = () => (
  <section className="relative flex min-h-80 items-center justify-center overflow-hidden px-6 py-6 sm:py-24 sm:min-h-[88vh]">
    <Image
      src="/services/marriage-decoration/cover.jpg"
      alt=""
      fill
      priority
      className="object-cover"
      sizes="100vw"
    />
    {/* cinematic dark overlay */}
    <div className="from-brand-ink/92 via-brand-brown/85 to-brand-copper/75 absolute inset-0 bg-linear-to-br" />

    <div className="relative z-10 flex max-w-3xl flex-col items-center gap-4 text-center text-white sm:gap-6">
      <h1 className="font-display text-4xl leading-tight font-bold sm:text-5xl md:text-6xl">
        {TAGLINE}
      </h1>
      <p className="text-body-xl max-w-xl text-white/85">
        Surat&apos;s Trusted Decoration &amp; Event Management Experts
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button
          asChild
          size="xl"
          className="text-brand-brown hover:bg-brand-cream bg-white"
        >
          <a href={TEL}>
            <IconPhone className="size-5" />
            Call Now
          </a>
        </Button>
        <Button
          asChild
          size="xl"
          className="bg-brand-copper hover:bg-brand-copper/85 border border-white/30 text-white"
        >
          <a href={waLink()} target="_blank" rel="noopener noreferrer">
            <IconBrandWhatsapp className="size-5" />
            WhatsApp Us
          </a>
        </Button>
      </div>

      <div className="mt-4 flex max-w-full flex-wrap items-center justify-center gap-2.5">
        {HERO_PILLS.map((pill) => (
          <span
            key={pill.label}
            className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm font-medium whitespace-nowrap backdrop-blur-sm"
          >
            {pill.value && (
              <span className="text-brand-gold font-semibold">
                {pill.value}{' '}
              </span>
            )}
            {pill.label}
          </span>
        ))}
      </div>
    </div>
  </section>
)
