import { Button } from '@pkg/ui'
import { IconBrandInstagram } from '@tabler/icons-react'

import Image from 'next/image'

import { INSTAGRAM, SOCIAL_HANDLE } from '@/config/site'

export type FeedItem = {
  id: string
  image: string | null
  href: string
  caption: string | null
}

/** "Latest on Instagram" feed widget for the home page. */
export const InstagramFeed = ({ items }: { items: FeedItem[] }) => {
  if (!items.length) return null

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="border-border/60 bg-card mx-auto max-w-6xl rounded-md border p-5 shadow-sm md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/borda-icon.png"
              alt="Borda Event"
              width={44}
              height={44}
              className="size-11 rounded-full"
            />
            <div>
              <p className="text-brand-ink font-display text-lg font-semibold">
                Latest on Instagram
              </p>
              <p className="text-muted-foreground text-sm">
                @{SOCIAL_HANDLE} · {items.length} posts
              </p>
            </div>
          </div>
          <Button
            asChild
            className="bg-brand-copper hover:bg-brand-copper/85 text-white"
          >
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
              <IconBrandInstagram className="size-4" />
              Follow us
            </a>
          </Button>
        </div>

        {/* Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.caption ?? 'View on Instagram'}
              className="group relative block aspect-square overflow-hidden rounded-md"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.caption ?? 'Instagram post'}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="bg-brand-brown/5 flex h-full w-full items-center justify-center">
                  <IconBrandInstagram className="text-brand-brown/25 size-8" />
                </div>
              )}

              <IconBrandInstagram className="absolute top-2 right-2 size-5 text-white drop-shadow" />

              <div className="from-brand-ink/85 absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t to-transparent p-2.5 pt-8">
                <Image
                  src="/borda-icon.png"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 shrink-0 rounded-full ring-1 ring-white/40"
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-white">
                    {SOCIAL_HANDLE}
                  </span>
                  {item.caption && (
                    <span className="block truncate text-[11px] text-white/70">
                      {item.caption}
                    </span>
                  )}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
