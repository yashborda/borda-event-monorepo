import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react'

import Link from 'next/link'

type Props = {
  page: number
  totalPages: number
  total: number
  limit: number
  buildHref: (page: number) => string
}

const NavButton = ({
  href,
  disabled,
  children,
}: {
  href: string
  disabled: boolean
  children: React.ReactNode
}) => {
  if (disabled) {
    return (
      <span className="border-border text-muted-foreground flex size-9 cursor-not-allowed items-center justify-center rounded-md border opacity-40">
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className="border-border text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-md border transition-colors"
    >
      {children}
    </Link>
  )
}

export const Pagination = ({
  page,
  totalPages,
  total,
  limit,
  buildHref,
}: Props) => {
  const from = Math.min((page - 1) * limit + 1, total)
  const to = Math.min(page * limit, total)

  const range: number[] = []
  const rangeWithDots: (number | '...')[] = []
  const delta = 1
  const left = Math.max(2, page - delta)
  const right = Math.min(totalPages - 1, page + delta)

  range.push(1)
  for (let i = left; i <= right; i++) range.push(i)
  if (totalPages > 1) range.push(totalPages)

  let prev: number | undefined
  for (const p of range) {
    if (prev !== undefined) {
      if (p - prev === 2) rangeWithDots.push(prev + 1)
      else if (p - prev > 2) rangeWithDots.push('...')
    }
    rangeWithDots.push(p)
    prev = p
  }

  return (
    <div className="mt-12">
      {total > 0 && (
        <p className="text-muted-foreground text-body-sm mb-4 text-center font-medium">
          {from}–{to} of {total}
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <NavButton href={buildHref(1)} disabled={page === 1}>
            <IconChevronsLeft className="size-4" />
          </NavButton>

          <NavButton href={buildHref(page - 1)} disabled={page === 1}>
            <IconChevronLeft className="size-4" />
          </NavButton>

          {/* Page numbers — hidden on mobile */}
          <div className="hidden sm:contents">
            {rangeWithDots.map((item, idx) =>
              item === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="text-muted-foreground px-1 text-sm select-none"
                >
                  …
                </span>
              ) : (
                <Link
                  key={item}
                  href={buildHref(item)}
                  className={`flex size-9 items-center justify-center rounded-md border text-sm transition-colors ${
                    item === page
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {item}
                </Link>
              )
            )}
          </div>

          <NavButton href={buildHref(page + 1)} disabled={page === totalPages}>
            <IconChevronRight className="size-4" />
          </NavButton>

          <NavButton
            href={buildHref(totalPages)}
            disabled={page === totalPages}
          >
            <IconChevronsRight className="size-4" />
          </NavButton>
        </div>
      )}
    </div>
  )
}
