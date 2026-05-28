import { trimEnd } from 'lodash'
import { createLoader } from 'nuqs/server'

import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { env } from '@/env'

import {
  getCategoryWithBlogs,
  getPublishedBlogs,
  getPublishedCategories,
} from '@/lib/blog-api'
import { blogSearchParsers } from '@/lib/blog-search-params'

import { getPageSeoMetadata } from '@/utils/seo.helper'

import { BlogGrid } from '@/app/_components/blog-grid'
import { BlogPageHero } from '@/app/_components/blog-page-hero'
import { CategoryFilter } from '@/app/_components/category-filter'
import { PageContent } from '@/app/_components/page-content'
import { Pagination } from '@/app/_components/pagination'

import { BlogSearchInput } from '../../_components/blog-search-input'

export const revalidate = 604800

const siteUrl = trimEnd(env.NEXT_PUBLIC_SITE_URL, '/')

const loadSearchParams = createLoader(blogSearchParsers)

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; search?: string }>
}

const BlogCategoryPage = async ({ params, searchParams }: Props) => {
  const [{ slug }, raw] = await Promise.all([params, searchParams])

  if (raw.page === '1') {
    const qs = raw.search ? `?search=${encodeURIComponent(raw.search)}` : ''
    permanentRedirect(`/blog/category/${slug}${qs}`)
  }

  const { page: rawPage, search } = loadSearchParams(raw)
  const page = Math.max(1, rawPage)
  const limit = 12

  const [categoryResult, blogsResult, categories] = await Promise.all([
    getCategoryWithBlogs(slug),
    getPublishedBlogs({
      categorySlug: slug,
      page,
      limit,
      search: search || undefined,
    }),
    getPublishedCategories(),
  ])

  if (!categoryResult) notFound()

  const { category } = categoryResult
  const { data: blogs, total } = blogsResult
  const totalPages = Math.ceil(total / limit)

  const basePath = `/blog/category/${slug}`

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (search) params.set('search', search)
    const qs = params.toString()
    return `${basePath}${qs ? `?${qs}` : ''}`
  }

  return (
    <main>
      <BlogPageHero
        title={category.categoryName}
        description={category.excerpt ?? category.ogDescription ?? undefined}
      >
        <BlogSearchInput />
      </BlogPageHero>

      <PageContent>
        <CategoryFilter
          categories={categories}
          activeSlug={slug}
          allHref="/blog"
        />

        <BlogGrid posts={blogs} emptyMessage="No posts in this category yet." />

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

export default BlogCategoryPage

export const generateMetadata = async ({
  params,
  searchParams,
}: Props): Promise<Metadata> => {
  const [{ slug }, raw] = await Promise.all([params, searchParams])
  const result = await getCategoryWithBlogs(slug)
  if (!result) return {}

  const { category } = result
  const { page: rawPage } = loadSearchParams(raw)
  const page = Math.max(1, rawPage)
  const basePath = `${siteUrl}/blog/category/${category.slug}`
  const canonical =
    page > 1 ? `${basePath}?page=${page}` : category.canonicalUrl || basePath

  return getPageSeoMetadata({
    canonical,
    title: category.metaTitle || `${category.categoryName} — Blog`,
    description: category.metaDescription,
    keywords: category.metaKeywords,
    ogType: 'website',
    ogTitle: category.ogTitle,
    ogDescription: category.ogDescription,
    ogImageUrl: category.ogImage?.url || category.bannerImage?.url,
    twitterTitle: category.twitterTitle,
    twitterDescription: category.twitterDescription,
    twitterImageUrl: category.twitterImage?.url,
    robots: category.robots,
    googlebot: category.googlebot,
  })
}
