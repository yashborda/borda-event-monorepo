import { Badge, Heading, RichContent } from '@pkg/ui'
import { trimEnd } from 'lodash'

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Script from 'next/script'

import { env } from '@/env'

import { getBlogBySlug } from '@/lib/blog-api'

import { getPageSeoMetadata } from '@/utils/seo.helper'

import { BlogMeta } from '@/app/(public)/_components/blog-meta'
import { Breadcrumb } from '@/app/(public)/_components/breadcrumb'
import { RelatedBlogs } from '@/app/(public)/blog/_components/related-blogs'

export const revalidate = 604800

const siteUrl = trimEnd(env.NEXT_PUBLIC_SITE_URL, '/')

type Props = { params: Promise<{ slug: string }> }

const BlogPostPage = async ({ params }: Props) => {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog) notFound()

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt || undefined,
    ...(blog.featuredImage ? { image: blog.featuredImage.url } : {}),
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt,
    url: `${siteUrl}/blog/${blog.slug}`,
    ...(blog.author
      ? {
          author: {
            '@type': 'Person',
            name: blog.author.fullName,
            url: `${siteUrl}/blog/author/${blog.author.slug}`,
          },
        }
      : {}),
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Breadcrumb
        items={[
          { label: 'Blog', href: '/blog' },
          ...(blog.categories[0]
            ? [
                {
                  label: blog.categories[0].categoryName,
                  href: `/blog/category/${blog.categories[0].slug}`,
                },
              ]
            : []),
          { label: blog.title },
        ]}
      />

      <article>
        {/* Category + tag badges */}
        {(blog.categories.length > 0 || blog.tags.length > 0) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {blog.categories.map((cat) => (
              <Link key={cat.id} href={`/blog/category/${cat.slug}`}>
                <Badge variant="secondary">{cat.categoryName}</Badge>
              </Link>
            ))}
            {blog.tags.map((tag) => (
              <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                <Badge variant="outline-secondary">{tag.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <Heading as="h1" size="2xl" className="mb-6">
          {blog.title}
        </Heading>

        <BlogMeta
          author={blog.author}
          publishedAt={blog.publishedAt}
          readingTime={blog.readingTime}
        />

        {/* Featured image */}
        {blog.featuredImage && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={blog.featuredImage.url}
              alt={blog.featuredImageAlt ?? blog.title}
              fill
              priority
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* Content */}
        <RichContent html={blog.content ?? ''} />
      </article>

      {/* <div className="mt-12">
        <Button variant="ghost-secondary" size="sm" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blog
          </Link>
        </Button>
      </div> */}

      <RelatedBlogs
        excludeSlug={slug}
        categorySlug={blog.categories[0]?.slug}
      />

      <Script
        id={`blog-post-schema-${blog.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
    </main>
  )
}

export default BlogPostPage

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog) return {}

  return getPageSeoMetadata({
    canonical: blog.canonicalUrl || `${siteUrl}/blog/${blog.slug}`,
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    keywords: blog.metaKeywords,
    ogType: 'article',
    ogTitle: blog.ogTitle,
    ogDescription: blog.ogDescription,
    ogImageUrl: blog.ogImage?.url || blog.featuredImage?.url,
    twitterTitle: blog.twitterTitle,
    twitterDescription: blog.twitterDescription,
    twitterImageUrl: blog.twitterImage?.url,
    robots: blog.robots,
    googlebot: blog.googlebot,
  })
}
