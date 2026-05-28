import { Button } from '@pkg/ui'

import Link from 'next/link'

import { getPublishedBlogs } from '@/lib/blog-api'

import { BlogCard } from './blog-card'

type Props = {
  excludeSlug?: string
}

export const LatestBlogs = async ({ excludeSlug }: Props) => {
  const { data } = await getPublishedBlogs({ limit: 4 })
  const blogs = data.filter((b) => b.slug !== excludeSlug).slice(0, 3)

  if (blogs.length === 0) return null

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            slug={blog.slug}
            title={blog.title}
            excerpt={blog.excerpt}
            featuredImageUrl={blog.featuredImage?.url ?? null}
            featuredImageAlt={blog.featuredImageAlt ?? blog.title}
            publishedAt={blog.publishedAt}
            categories={blog.categories}
          />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button variant="outline" size="lg" asChild>
          <Link href="/blog">View all blogs</Link>
        </Button>
      </div>
    </section>
  )
}
