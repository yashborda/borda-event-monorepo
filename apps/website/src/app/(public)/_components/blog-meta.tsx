import type { IBlogListItem } from '@pkg/types'
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@pkg/ui'

import Link from 'next/link'

type Props = {
  author: IBlogListItem['author']
  publishedAt: string | null
  readingTime: number
}

export const BlogMeta = ({ author, publishedAt, readingTime }: Props) => {
  const publishedDateFormatted = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : null

  return (
    <div className="mb-8 flex flex-wrap items-center gap-4">
      {author && (
        <Link
          href={`/blog/author/${author.slug}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={author.avatar?.url ?? undefined}
              alt={author.fullName}
            />
            <AvatarFallback>
              {author.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-body-md text-foreground font-medium">
              {author.fullName}
            </p>
          </div>
        </Link>
      )}
      {publishedDateFormatted && (
        <span className="text-muted-foreground text-body-sm">
          {publishedDateFormatted}
        </span>
      )}
      {readingTime > 0 && (
        <Badge variant="outline" className="text-xs">
          {readingTime} min read
        </Badge>
      )}
    </div>
  )
}
