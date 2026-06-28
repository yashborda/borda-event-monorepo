import { IconClipboardList, IconConfetti, IconPhone } from '@tabler/icons-react'

import { SectionHeading } from '../section-heading'

const STEPS = [
  {
    Icon: IconPhone,
    title: 'Contact Us',
    desc: 'Reach out on WhatsApp or call with your event date and idea.',
  },
  {
    Icon: IconClipboardList,
    title: 'We Plan Together',
    desc: 'We design a custom theme, share a quote, and finalise every detail.',
  },
  {
    Icon: IconConfetti,
    title: 'We Deliver Magic',
    desc: 'Our team sets up on time so you simply walk in and celebrate.',
  },
]

export const HowItWorks = () => (
  <section className="bg-muted/40 px-6 py-10 md:py-24">
    <div className="mx-auto max-w-5xl">
      <SectionHeading
        align="center"
        label="How It Works"
        title="Three Simple Steps"
      />

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="relative flex flex-col items-center text-center"
          >
            <div className="bg-brand-copper flex size-16 items-center justify-center rounded-full text-white shadow-md">
              <step.Icon className="size-7" stroke={1.5} />
            </div>
            <span className="text-brand-gold mt-4 text-sm font-semibold">
              Step {i + 1}
            </span>
            <h3 className="text-brand-ink font-display mt-1 text-xl font-semibold">
              {step.title}
            </h3>
            <p className="text-muted-foreground text-body-md mt-2 max-w-xs">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
