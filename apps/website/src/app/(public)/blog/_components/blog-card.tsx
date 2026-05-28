import { Badge, Heading } from '@pkg/ui'

import Link from 'next/link'

import { BlogPostImage } from './blog-post-image'

type BlogCardProps = {
  slug: string
  title: string
  excerpt: string | null
  featuredImageUrl: string | null
  featuredImageAlt: string
  publishedAt: string | null
  categories: { id: string; categoryName: string; slug: string }[]
}

export const BlogCard = ({
  slug,
  title,
  excerpt,
  featuredImageUrl,
  featuredImageAlt,
  publishedAt,
  categories,
}: BlogCardProps) => {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : null

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <div className="border-border bg-card flex h-full flex-col overflow-hidden rounded-xl border transition-colors">
        {/* Image with category overlay */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden">
          <BlogPostImage src={featuredImageUrl ?? ''} alt={featuredImageAlt} />
          {categories.length > 0 && (
            <div className="absolute right-3 bottom-3 flex flex-wrap justify-end gap-1">
              {categories.map((cat) => (
                <Badge key={cat.id} variant="secondary">
                  {cat.categoryName}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-5">
          {formattedDate && (
            <p className="text-muted-foreground text-body-sm">
              {formattedDate}
            </p>
          )}
          <Heading
            as="h3"
            size="sm"
            className="group-hover:text-primary line-clamp-2 leading-snug group-hover:underline"
          >
            {title}
          </Heading>
          {excerpt && (
            <p className="text-muted-foreground text-body-sm line-clamp-3">
              {excerpt}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
