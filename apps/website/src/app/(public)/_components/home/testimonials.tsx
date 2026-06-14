'use client'

import { IconStarFilled } from '@tabler/icons-react'

import { SectionHeading } from '../section-heading'

const REVIEWS = [
  {
    quote:
      'Borda Event turned our wedding into a dream. Every detail was elegant and perfectly on time.',
    name: 'Priya & Rahul',
    event: 'Wedding Decoration',
  },
  {
    quote:
      'The engagement stage was stunning and the team was so easy to work with. Highly recommended!',
    name: 'Anjali Shah',
    event: 'Engagement',
  },
  {
    quote:
      'Our baby shower looked magical. Beautiful themes and great value for the price.',
    name: 'Meera Patel',
    event: 'Baby Shower',
  },
  {
    quote:
      'Best decorators in Surat. The haldi and garba setups were full of colour and energy.',
    name: 'Kunal Desai',
    event: 'Pre-Wedding',
  },
  {
    quote:
      'Professional, punctual, and creative. They handled everything so we could enjoy the day.',
    name: 'Sneha Joshi',
    event: 'Reception',
  },
]

const ReviewCard = ({ review }: { review: (typeof REVIEWS)[number] }) => (
  <figure className="bg-card border-brand-copper w-[300px] shrink-0 rounded-md border-l-4 p-6 shadow-sm">
    <div className="text-brand-gold flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStarFilled key={i} className="size-4" />
      ))}
    </div>
    <blockquote className="text-brand-ink/90 text-body-md mt-3 italic">
      &ldquo;{review.quote}&rdquo;
    </blockquote>
    <figcaption className="mt-4">
      <span className="text-brand-ink block font-semibold">{review.name}</span>
      <span className="text-muted-foreground text-sm">{review.event}</span>
    </figcaption>
  </figure>
)

export const Testimonials = () => {
  const loop = [...REVIEWS, ...REVIEWS]
  return (
    <section className="overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          align="center"
          label="Testimonials"
          title="What Our Clients Say"
        />
      </div>
      <div className="mt-10 overflow-hidden">
        <div className="animate-marquee flex w-max gap-5">
          {loop.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}
