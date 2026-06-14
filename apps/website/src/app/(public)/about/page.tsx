import { IconChevronRight } from '@tabler/icons-react'

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { getPageSeoMetadata } from '@/utils/seo.helper'

import { LOCATION, OWNER_NAME } from '@/config/site'

import { StatsBand } from '../_components/home/stats-band'
import { SectionHeading } from '../_components/section-heading'
import { WhatsAppCta } from '../_components/whatsapp-cta'

export const metadata: Metadata = getPageSeoMetadata({
  canonical: '/about',
  title: 'About Us | Borda Event',
  description:
    'Borda Event is a luxury decoration & event-management studio in Surat, Gujarat — turning every celebration into an unforgettable experience.',
})

const VALUES = [
  {
    title: 'Personal & bespoke',
    desc: 'Every setup is designed around your story, never a template.',
  },
  {
    title: 'Reliable execution',
    desc: 'On-time setup and teardown, handled end to end by our team.',
  },
  {
    title: 'Honest pricing',
    desc: 'Premium décor that respects your budget — no hidden costs.',
  },
]

const AboutPage = () => (
  <main>
    {/* Hero + breadcrumb */}
    <section className="bg-brand-brown px-6 py-16 text-center text-white md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          About Borda Event
        </h1>
        <p className="text-body-lg mt-3 text-white/85">
          Your Celebration, Our Creation.
        </p>
        <nav
          aria-label="Breadcrumb"
          className="mt-5 flex items-center justify-center gap-1 text-sm text-white/70"
        >
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <IconChevronRight className="size-4" />
          <span className="text-white">About</span>
        </nav>
      </div>
    </section>

    {/* Story */}
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div>
          <SectionHeading
            label="Our Story"
            title="Crafting celebrations in Surat"
          />
          <div className="text-muted-foreground text-body-lg mt-6 space-y-4">
            <p>
              Borda Event is a luxury decoration and event-management studio
              based in {LOCATION}. From intimate ceremonies to grand weddings,
              we design and execute every detail so your day feels effortless
              and unforgettable.
            </p>
            <p>
              Led by {OWNER_NAME}, our team blends tradition with modern design
              — mandaps, stages, entries, florals, lighting and more — all
              tailored to your taste and budget.
            </p>
          </div>
        </div>
        <div className="border-border/60 relative aspect-4/3 overflow-hidden rounded-md border shadow-sm">
          <Image
            src="/services/lagan-lekhan/cover.jpg"
            alt="Borda Event decoration work"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="bg-muted/40 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          align="center"
          label="What We Stand For"
          title="Why couples choose us"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="bg-card border-border/60 rounded-md border p-6 text-center"
            >
              <h3 className="text-brand-ink font-display text-lg font-semibold">
                {v.title}
              </h3>
              <p className="text-muted-foreground text-body-md mt-2">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <StatsBand />
    <WhatsAppCta />
  </main>
)

export default AboutPage
