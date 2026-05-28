'use client'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Label,
  Textarea,
} from '@pkg/ui'

import { useState } from 'react'

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    console.log('Contact form:', Object.fromEntries(data))
    setSubmitted(true)
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Heading as="h1" size="2xl" className="mb-8 text-center">
          Contact us
        </Heading>

        {submitted ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-foreground text-lg font-medium">
                Thanks for reaching out!
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                We&apos;ll get back to you within 1–2 business days.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="How can we help?"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

export default ContactPage
