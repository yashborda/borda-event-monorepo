import { Avatar, AvatarFallback, AvatarImage, Badge, Heading } from '@pkg/ui'
import { IconCamera, IconLink, IconWorld, IconX } from '@tabler/icons-react'
import { trimEnd } from 'lodash'
import { createLoader, parseAsInteger } from 'nuqs/server'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import Script from 'next/script'

import { env } from '@/env'

import { getAuthorWithBlogs } from '@/lib/blog-api'

import { getPageSeoMetadata } from '@/utils/seo.helper'

import { BlogGrid } from '@/app/_components/blog-grid'
import { PageContent } from '@/app/_components/page-content'
import { Pagination } from '@/app/_components/pagination'

export const revalidate = 604800

const siteUrl = trimEnd(env.NEXT_PUBLIC_SITE_URL, '/')

const loadSearchParams = createLoader({
  page: parseAsInteger.withDefault(1),
})

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

const BlogAuthorPage = async ({ params, searchParams }: Props) => {
  const [{ slug }, raw] = await Promise.all([params, searchParams])

  if (raw.page === '1') permanentRedirect(`/blog/author/${slug}`)

  const { page: rawPage } = loadSearchParams(raw)
  const page = Math.max(1, rawPage)
  const limit = 12

  const result = await getAuthorWithBlogs(slug, page, limit)
  if (!result) notFound()

  const { author, blogs: blogsResult } = result
  const { data: blogs, total } = blogsResult
  const totalPages = Math.ceil(total / limit)

  const buildHref = (p: number) => {
    const qs = p > 1 ? `?page=${p}` : ''
    return `/blog/author/${author.slug}${qs}`
  }

  const socialLinks = [
    author.website && {
      href: author.website,
      icon: IconWorld,
      label: 'Website',
    },
    author.twitter && { href: author.twitter, icon: IconX, label: 'Twitter' },
    author.linkedin && {
      href: author.linkedin,
      icon: IconLink,
      label: 'LinkedIn',
    },
    author.instagram && {
      href: author.instagram,
      icon: IconCamera,
      label: 'Instagram',
    },
  ].filter(Boolean) as {
    href: string
    icon: React.ComponentType<{ className?: string }>
    label: string
  }[]

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.fullName,
    url: `${siteUrl}/blog/author/${author.slug}`,
    ...(socialLinks.length > 0
      ? { sameAs: socialLinks.map((l) => l.href) }
      : {}),
  }

  return (
    <main>
      {/* Author hero */}
      <section className="from-primary to-primary/60 bg-linear-to-br py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="text-primary-foreground/70 text-body-sm mb-8 flex items-center gap-1.5">
            <Link
              href="/blog"
              className="hover:text-primary-foreground transition-colors"
            >
              Blog
            </Link>
            <span>/</span>
            <span className="text-primary-foreground">{author.fullName}</span>
          </nav>

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 shrink-0 sm:h-28 sm:w-28">
              <AvatarImage src={author.avatar?.url} alt={author.fullName} />
              <AvatarFallback className="text-heading-md">
                {author.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Heading
                as="h1"
                size="2xl"
                className="text-primary-foreground mb-1"
              >
                {author.fullName}
              </Heading>
              {author.designation && (
                <p className="text-primary-foreground/80 text-body-md mb-3">
                  {author.designation}
                </p>
              )}
              {author.bio && (
                <p className="text-primary-foreground/90 text-body-md mb-4 max-w-2xl">
                  {author.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="secondary">
                  {total} {total === 1 ? 'article' : 'articles'}
                </Badge>
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-3">
                    {socialLinks.map(({ href, icon: Icon, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageContent>
        <BlogGrid posts={blogs} emptyMessage="No posts by this author yet." />
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          buildHref={buildHref}
        />
      </PageContent>

      <Script
        id={`author-schema-${author.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </main>
  )
}

export default BlogAuthorPage

export const generateMetadata = async ({
  params,
  searchParams,
}: Props): Promise<Metadata> => {
  const [{ slug }, raw] = await Promise.all([params, searchParams])
  const result = await getAuthorWithBlogs(slug)
  if (!result) return {}

  const { author } = result
  const { page: rawPage } = loadSearchParams(raw)
  const page = Math.max(1, rawPage)
  const basePath = `${siteUrl}/blog/author/${author.slug}`
  const canonical = page > 1 ? `${basePath}?page=${page}` : basePath

  const description = author.bio
    ? author.bio.slice(0, 160)
    : `Articles written by ${author.fullName}.`

  return getPageSeoMetadata({
    canonical,
    title: `${author.fullName} — Blog`,
    description,
    ogType: 'website',
    ogTitle: author.fullName,
    ogDescription: description,
  })
}
