'use client'

import { cn } from '@pkg/ui'

import Link from 'next/link'

import { useState } from 'react'

const VISIBLE_LIMIT = 3

type Category = {
  slug: string
  categoryName: string
}

type Props = {
  categories: Category[]
  activeSlug?: string
  allHref?: string
}

export const CategoryFilter = ({
  categories,
  activeSlug,
  allHref = '/blog',
}: Props) => {
  const [expanded, setExpanded] = useState(false)

  if (categories.length === 0) return null

  const activeClass = 'bg-primary/20 text-foreground border-primary'
  const inactiveClass =
    'border-border text-muted-foreground hover:border-primary hover:text-foreground'
  const base =
    'rounded-md border px-4 py-1.5 text-sm font-medium transition-colors'

  const remaining = categories.length - VISIBLE_LIMIT

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Link
        href={allHref}
        className={cn(base, !activeSlug ? activeClass : inactiveClass)}
      >
        All
      </Link>
      {categories.map((cat, index) => (
        <Link
          key={cat.slug}
          href={`/blog/category/${cat.slug}`}
          className={cn(
            base,
            activeSlug === cat.slug ? activeClass : inactiveClass,
            !expanded && index >= VISIBLE_LIMIT && 'hidden md:flex'
          )}
        >
          {cat.categoryName}
        </Link>
      ))}
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(base, inactiveClass, 'md:hidden', expanded && 'hidden')}
        >
          +{remaining} more
        </button>
      )}
    </div>
  )
}
