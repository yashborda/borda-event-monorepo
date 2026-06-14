'use client'

import { Logo, cn } from '@pkg/ui'

import Image from 'next/image'

import * as React from 'react'

type MediaWithFallbackProps = {
  src?: string | null
  alt: string
  /** Tailwind sizes hint for responsive loading. */
  sizes?: string
  className?: string
}

/**
 * Renders a cover image, falling back to the centred Borda logo on a warm
 * brand tile when there's no source or the image fails to load.
 */
export const MediaWithFallback = ({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw',
  className,
}: MediaWithFallbackProps) => {
  const [errored, setErrored] = React.useState(false)

  if (!src || errored) {
    return (
      <div
        className={cn(
          'bg-brand-brown/5 flex h-full w-full items-center justify-center p-6',
          className
        )}
        aria-label={alt}
      >
        <Logo className="w-2/3 max-w-40 opacity-15" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      onError={() => setErrored(true)}
      className={cn('object-cover', className)}
    />
  )
}
