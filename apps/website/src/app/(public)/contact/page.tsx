'use client'

import { Button, Card, CardContent, Input, Label, Textarea } from '@pkg/ui'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconCheck,
  IconMapPin,
  IconPhone,
} from '@tabler/icons-react'

import * as React from 'react'

import { ApiError, apiFetch } from '@/lib/api-client'

import {
  FACEBOOK,
  INSTAGRAM,
  LOCATION,
  MAPS_URL,
  PHONE,
  SOCIAL_HANDLE,
  TEL,
  waLink,
} from '@/config/site'

const CONTACT_LINKS = [
  { Icon: IconPhone, label: PHONE, href: TEL },
  { Icon: IconBrandWhatsapp, label: 'Chat on WhatsApp', href: waLink() },
  { Icon: IconBrandInstagram, label: SOCIAL_HANDLE, href: INSTAGRAM },
  { Icon: IconBrandFacebook, label: SOCIAL_HANDLE, href: FACEBOOK },
  { Icon: IconMapPin, label: LOCATION, href: MAPS_URL },
]

const ContactPage = () => {
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const phone = String(form.get('phone') ?? '').trim()
    const message = String(form.get('message') ?? '').trim()
    const eventDate = String(form.get('eventDate') ?? '').trim()

    if (!name || !phone) {
      setError('Please enter your name and phone number.')
      return
    }

    setSubmitting(true)
    try {
      await apiFetch('/api/website/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          name,
          phone,
          ...(message ? { message } : {}),
          ...(eventDate ? { eventDate } : {}),
        }),
      })
      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again or reach us on WhatsApp.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-brown px-6 py-16 text-center text-white md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            Get in Touch
          </h1>
          <p className="text-body-lg mt-3 text-white/85">
            Tell us your date and vision — we&apos;ll plan the rest.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          {/* Contact details */}
          <div>
            <h2 className="text-brand-ink font-display text-2xl font-bold">
              Contact details
            </h2>
            <p className="text-muted-foreground text-body-md mt-2">
              Reach out any way you like — we usually reply the same day.
            </p>
            <ul className="mt-6 space-y-4">
              {CONTACT_LINKS.map((c) => {
                const content = (
                  <span className="flex items-center gap-3">
                    <span className="bg-brand-copper/10 text-brand-copper inline-flex size-10 shrink-0 items-center justify-center rounded-md">
                      <c.Icon className="size-5" stroke={1.5} />
                    </span>
                    <span className="text-brand-ink">{c.label}</span>
                  </span>
                )
                return (
                  <li key={c.href}>
                    {c.href ? (
                      <a
                        href={c.href}
                        target={
                          c.href.startsWith('http') ? '_blank' : undefined
                        }
                        rel="noopener noreferrer"
                        className="hover:text-brand-copper transition-colors"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Enquiry form */}
          <Card>
            <CardContent className="py-6">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <span className="bg-brand-copper/10 text-brand-copper inline-flex size-12 items-center justify-center rounded-full">
                    <IconCheck className="size-6" />
                  </span>
                  <p className="text-brand-ink text-lg font-semibold">
                    Thank you for reaching out!
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We&apos;ve received your enquiry and will contact you
                    shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="eventDate">Event date</Label>
                    <Input id="eventDate" name="eventDate" type="date" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Tell us about your event…"
                    />
                  </div>

                  {error && <p className="text-destructive text-sm">{error}</p>}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? 'Sending…' : 'Send Enquiry'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

export default ContactPage
