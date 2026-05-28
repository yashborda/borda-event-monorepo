import type {
  IBlogCategory,
  IBlogCategoryDetail,
  IBlogDetail,
  IBlogListItem,
} from '@pkg/types'

const BACKEND_URL =
  process.env['BACKEND_INTERNAL_URL'] ?? 'http://localhost:3002'

type PaginatedBlogs = {
  data: IBlogListItem[]
  total: number
  page: number
  limit: number
}

export const getPublishedBlogs = async (params: {
  page?: number
  limit?: number
  search?: string
  categorySlug?: string
}): Promise<PaginatedBlogs> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.categorySlug) query.set('categorySlug', params.categorySlug)

  const url = `${BACKEND_URL}/api/website/blog?${query.toString()}`
  const res = await fetch(url, {
    next: { revalidate: 604800, tags: ['blogs'] },
  })
  if (!res.ok) return { data: [], total: 0, page: 1, limit: 10 }
  return res.json() as Promise<PaginatedBlogs>
}

export const getBlogBySlug = async (
  slug: string
): Promise<IBlogDetail | null> => {
  const url = `${BACKEND_URL}/api/website/blog/${encodeURIComponent(slug)}`
  const res = await fetch(url, {
    next: { revalidate: 604800, tags: [`blog-${slug}`, 'blogs'] },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch blog: ${res.status}`)
  return res.json() as Promise<IBlogDetail>
}

export const getPublishedCategories = async (): Promise<IBlogCategory[]> => {
  const url = `${BACKEND_URL}/api/website/blog/categories`
  const res = await fetch(url, {
    next: { revalidate: 604800, tags: ['blog-categories'] },
  })
  if (!res.ok) return []
  return res.json() as Promise<IBlogCategory[]>
}

export const getCategoryWithBlogs = async (
  slug: string,
  page?: number
): Promise<{
  category: IBlogCategoryDetail
  blogs: PaginatedBlogs
} | null> => {
  const query = new URLSearchParams()
  if (page) query.set('page', String(page))

  const url = `${BACKEND_URL}/api/website/blog/categories/${encodeURIComponent(slug)}?${query.toString()}`
  const res = await fetch(url, {
    next: {
      revalidate: 604800,
      tags: [`blog-category-${slug}`, 'blog-categories'],
    },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch category: ${res.status}`)
  return res.json() as Promise<{
    category: IBlogCategoryDetail
    blogs: PaginatedBlogs
  }>
}

export const getAuthorWithBlogs = async (
  slug: string,
  page?: number,
  limit?: number
): Promise<{
  author: {
    id: string
    fullName: string
    slug: string
    bio: string | null
    designation: string | null
    website: string | null
    twitter: string | null
    linkedin: string | null
    instagram: string | null
    avatar: { url: string } | null
  }
  blogs: PaginatedBlogs
} | null> => {
  const query = new URLSearchParams()
  if (page && page > 1) query.set('page', String(page))
  if (limit) query.set('limit', String(limit))
  const url = `${BACKEND_URL}/api/website/blog/authors/${encodeURIComponent(slug)}?${query.toString()}`
  const res = await fetch(url, {
    next: {
      revalidate: 604800,
      tags: [`blog-author-${slug}`, 'blog-authors'],
    },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch author: ${res.status}`)
  return res.json()
}

export const getAllAuthorSlugs = async (): Promise<{ slug: string }[]> => {
  const url = `${BACKEND_URL}/api/website/blog/authors/slugs`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export const getTagWithBlogs = async (
  slug: string,
  page?: number,
  limit?: number
): Promise<{
  tag: { id: string; name: string; slug: string; excerpt: string | null }
  blogs: PaginatedBlogs
} | null> => {
  const query = new URLSearchParams()
  if (page && page > 1) query.set('page', String(page))
  if (limit) query.set('limit', String(limit))
  const url = `${BACKEND_URL}/api/website/blog/tags/${encodeURIComponent(slug)}?${query.toString()}`
  const res = await fetch(url, {
    next: {
      revalidate: 604800,
      tags: [`blog-tag-${slug}`, 'blog-tags'],
    },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch tag: ${res.status}`)
  return res.json()
}

export const getAllTagSlugs = async (): Promise<{ slug: string }[]> => {
  const url = `${BACKEND_URL}/api/website/blog/tags/slugs`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export const getAllBlogSlugs = async (): Promise<{ slug: string }[]> => {
  const url = `${BACKEND_URL}/api/website/blog/slugs`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json() as Promise<{ slug: string }[]>
}

export const getAllCategorySlugs = async (): Promise<{ slug: string }[]> => {
  const url = `${BACKEND_URL}/api/website/blog/categories/slugs`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json() as Promise<{ slug: string }[]>
}
