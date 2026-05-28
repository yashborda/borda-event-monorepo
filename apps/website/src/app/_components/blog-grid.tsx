import { BlogCard } from '@/app/(public)/blog/_components/blog-card'

type BlogPost = {
  slug: string
  title: string
  excerpt: string | null
  featuredImage: { url: string } | null
  featuredImageAlt: string | null
  publishedAt: string | null
  categories: { id: string; categoryName: string; slug: string }[]
}

type Props = {
  posts: BlogPost[]
  emptyMessage?: string
}

export const BlogGrid = ({
  posts,
  emptyMessage = 'No posts found.',
}: Props) => {
  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground text-body-lg py-16 text-center">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {posts.map((post) => (
        <BlogCard
          key={post.slug}
          slug={post.slug}
          title={post.title}
          excerpt={post.excerpt}
          featuredImageUrl={post.featuredImage?.url ?? null}
          featuredImageAlt={post.featuredImageAlt ?? post.title}
          publishedAt={post.publishedAt}
          categories={post.categories}
        />
      ))}
    </div>
  )
}
