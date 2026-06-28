import {
  IconCamera,
  IconClock,
  IconCoin,
  IconPalette,
} from '@tabler/icons-react'

import Image from 'next/image'

import { SectionHeading } from '../section-heading'

const FEATURES = [
  {
    Icon: IconPalette,
    title: 'Custom Decoration Themes',
    desc: 'Bespoke designs tailored to your taste, venue, and budget.',
  },
  {
    Icon: IconClock,
    title: 'On-Time Execution',
    desc: 'Punctual setup and teardown — no last-minute surprises.',
  },
  {
    Icon: IconCoin,
    title: 'Competitive Pricing',
    desc: 'Premium décor that stays comfortably within budget.',
  },
  {
    Icon: IconCamera,
    title: 'Photography Included',
    desc: 'Capture every moment with our in-house photography.',
  },
]

export const WhyChooseUs = () => (
  <section className="bg-muted/40 px-6 py-10 md:py-24">
    <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
      <div>
        <SectionHeading
          label="Why Choose Us"
          title="Why Surat Trusts Borda Event"
        />
        <ul className="mt-8 space-y-6">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex gap-4">
              <span className="bg-brand-copper/10 text-brand-copper inline-flex size-11 shrink-0 items-center justify-center rounded-md">
                <f.Icon className="size-6" stroke={1.5} />
              </span>
              <div>
                <h3 className="text-brand-ink text-base font-semibold">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-body-md mt-0.5">
                  {f.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-border/60 relative aspect-4/3 overflow-hidden rounded-md border shadow-sm md:order-last">
        <Image
          src="/services/engagement/cover.jpg"
          alt="Borda Event decoration work"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  </section>
)
