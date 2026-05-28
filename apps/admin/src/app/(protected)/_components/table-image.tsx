import { IconPhoto } from '@tabler/icons-react'

import Image from 'next/image'

import { cn } from '@/lib/utils'

interface TableImageProps {
  src?: string | null
  alt: string
  /** Tailwind size classes for the container. Defaults to a 40×40 square. */
  className?: string
}

export function TableImage({ src, alt, className }: TableImageProps) {
  return (
    <div
      className={cn(
        'bg-muted relative isolate shrink-0 overflow-hidden rounded-md',
        'size-10',
        className
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" unoptimized />
      ) : (
        <div className="text-muted-foreground flex size-full items-center justify-center">
          <IconPhoto className="size-4" />
        </div>
      )}
    </div>
  )
}
