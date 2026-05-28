import { Badge } from '@pkg/ui'
import { trimEnd } from 'lodash'
import { createLoader, parseAsInteger } from 'nuqs/server'

import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { env } from '@/env'

import { getTagWithBlogs } from '@/lib/blog-api'

import { getPageSeoMetadata } from '@/utils/seo.helper'

import { BlogGrid } from '@/app/_components/blog-grid'
import { BlogPageHero } from '@/app/_components/blog-page-hero'
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

const BlogTagPage = async ({ params, searchParams }: Props) => {
  const [{ slug }, raw] = await Promise.all([params, searchParams])

  if (raw.page === '1') permanentRedirect(`/blog/tag/${slug}`)

  const { page: rawPage } = loadSearchParams(raw)
  const page = Math.max(1, rawPage)
  const limit = 12

  const result = await getTagWithBlogs(slug, page, limit)
  if (!result) notFound()

  const { tag, blogs: blogsResult } = result
  const { data: blogs, total } = blogsResult
  const totalPages = Math.ceil(total / limit)

  const buildHref = (p: number) => {
    const qs = p > 1 ? `?page=${p}` : ''
    return `/blog/tag/${tag.slug}${qs}`
  }

  return (
    <main>
      <BlogPageHero
        title={`#${tag.name}`}
        description={tag.excerpt ?? undefined}
      >
        <Badge variant="secondary" className="text-sm">
          {total} {total === 1 ? 'post' : 'posts'}
        </Badge>
      </BlogPageHero>

      <PageContent>
        <BlogGrid posts={blogs} emptyMessage="No posts with this tag yet." />
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          buildHref={buildHref}
        />
      </PageContent>
    </main>
  )
}

export default BlogTagPage

export const generateMetadata = async ({
  params,
  searchParams,
}: Props): Promise<Metadata> => {
  const [{ slug }, raw] = await Promise.all([params, searchParams])
  const result = await getTagWithBlogs(slug)
  if (!result) return {}

  const { tag } = result
  const { page: rawPage } = loadSearchParams(raw)
  const page = Math.max(1, rawPage)
  const basePath = `${siteUrl}/blog/tag/${tag.slug}`
  const canonical = page > 1 ? `${basePath}?page=${page}` : basePath

  return getPageSeoMetadata({
    canonical,
    title: `#${tag.name} — Blog`,
    description: `Browse all articles tagged with "${tag.name}".`,
    ogType: 'website',
  })
}
