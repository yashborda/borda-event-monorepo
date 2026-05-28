import Link from 'next/link'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
}

export const Breadcrumb = ({ items }: Props) => (
  <nav className="text-muted-foreground text-body-sm mb-8 flex flex-wrap items-center gap-1.5">
    {items.map((item, index) => (
      <span key={index} className="flex items-center gap-1.5">
        {index > 0 && <span>/</span>}
        {item.href ? (
          <Link
            href={item.href}
            className="hover:text-foreground transition-colors"
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-foreground line-clamp-1">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
)
