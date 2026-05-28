'use client'

import { IconPhoto } from '@tabler/icons-react'

import Image from 'next/image'

import * as React from 'react'

export const BlogPostImage = ({ src, alt }: { src: string; alt: string }) => {
  const [errored, setErrored] = React.useState(false)

  if (!src || errored) {
    return (
      <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center">
        <IconPhoto className="size-10 opacity-40" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      unoptimized
      onError={() => setErrored(true)}
    />
  )
}
