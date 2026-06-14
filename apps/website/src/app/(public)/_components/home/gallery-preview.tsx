import { Button, cn } from '@pkg/ui'
import { IconArrowRight } from '@tabler/icons-react'

import Image from 'next/image'
import Link from 'next/link'

import { GALLERY_IMAGES } from '@/content/media'

import { SectionHeading } from '../section-heading'

const TILES = GALLERY_IMAGES.slice(0, 6)
// Mixed tall/wide bento layout on larger screens.
const SPAN = ['sm:row-span-2', '', '', 'sm:col-span-2', '', 'sm:row-span-2']

export const GalleryPreview = () => (
  <section id="gallery" className="px-6 py-16 md:py-24">
    <div className="mx-auto max-w-6xl">
      <SectionHeading align="center" label="Gallery" title="Our Work Speaks" />

      <div className="mt-10 grid grid-cols-2 gap-3 sm:auto-rows-[170px] sm:grid-cols-3">
        {TILES.map((img, i) => (
          <div
            key={img.src + i}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-md sm:aspect-auto',
              SPAN[i]
            )}
          >
            <Image
              src={img.src}
              alt={img.label}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="from-brand-ink/80 absolute inset-0 flex items-end bg-linear-to-t to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="font-display text-sm font-semibold text-white">
                {img.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild size="lg" variant="outline-accent">
          <Link href="/services">
            View Full Gallery
            <IconArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
)
