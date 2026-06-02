import { createLoader, parseAsString } from 'nuqs/server'

import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

import { getPublishedBlogs, getPublishedCategories } from '@/lib/blog-api'
import { blogSearchParsers } from '@/lib/blog-search-params'

import { getPageSeoMetadata } from '@/utils/seo.helper'

import { BlogGrid } from '@/app/_components/blog-grid'
import { BlogPageHero } from '@/app/_components/blog-page-hero'
import { CategoryFilter } from '@/app/_components/category-filter'
import { PageContent } from '@/app/_components/page-content'
import { Pagination } from '@/app/_components/pagination'

import { BlogSearchInput } from './_components/blog-search-input'

export const revalidate = 604800

const loadSearchParams = createLoader({
  ...blogSearchParsers,
  category: parseAsString.withDefault(''),
})

type Props = {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>
}

const BlogPage = async ({ searchParams }: Props) => {
  const raw = await searchParams

  if (raw.page === '1') {
    const qs = new URLSearchParams()
    if (raw.category) qs.set('category', raw.category)
    if (raw.search) qs.set('search', raw.search)
    const query = qs.toString()
    permanentRedirect(`/blog${query ? `?${query}` : ''}`)
  }

  const {
    page: rawPage,
    category: categorySlug,
    search,
  } = loadSearchParams(raw)
  const page = Math.max(1, rawPage)
  const limit = 12

  const [categories, blogsResult] = await Promise.all([
    getPublishedCategories(),
    getPublishedBlogs({
      page,
      limit,
      categorySlug: categorySlug || undefined,
      search: search || undefined,
    }),
  ])

  const { data: blogs, total } = blogsResult
  const totalPages = Math.ceil(total / limit)

  const buildHref = (overrides: {
    page?: number
    category?: string | null
  }) => {
    const params = new URLSearchParams()
    const nextPage = overrides.page ?? page
    const nextCategory =
      'category' in overrides ? overrides.category : categorySlug
    if (nextPage > 1) params.set('page', String(nextPage))
    if (nextCategory) params.set('category', nextCategory)
    if (search) params.set('search', search)
    const qs = params.toString()
    return `/blog${qs ? `?${qs}` : ''}`
  }

  return (
    <main>
      <BlogPageHero
        title="The Borda Event Blog"
        description="Stories, inspiration, and ideas from the Borda Event team."
      >
        <BlogSearchInput />
      </BlogPageHero>

      {/* Content */}
      <PageContent>
        {/* Category filter tabs */}
        <CategoryFilter
          categories={categories}
          activeSlug={categorySlug || undefined}
        />

        {/* Blog grid */}
        <BlogGrid posts={blogs} emptyMessage="No blogs found." />

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          buildHref={(p) => buildHref({ page: p })}
        />
      </PageContent>
    </main>
  )
}

export default BlogPage

export const generateMetadata = async ({
  searchParams,
}: Props): Promise<Metadata> => {
  const raw = await searchParams
  const { page: rawPage } = loadSearchParams(raw)
  const page = Math.max(1, rawPage)
  const canonical = page > 1 ? `/blog?page=${page}` : '/blog'

  return getPageSeoMetadata({
    title: 'Blog — Borda Event',
    description: 'Stories, inspiration, and ideas from the Borda Event team.',
    canonical,
  })
}
