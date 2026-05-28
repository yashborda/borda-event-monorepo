import { Skeleton } from '@pkg/ui'

import Link from 'next/link'

import { Fragment } from 'react'

type IBreadcrumb = {
  label: string
  href?: string
}

type IPageHeaderProps = {
  title: string
  breadcrumbs?: IBreadcrumb[]
  badge?: React.ReactNode
  description?: string
  action?: React.ReactNode
  loading?: boolean
}

const PageHeader = ({
  title,
  breadcrumbs,
  badge,
  description,
  action,
  loading,
}: IPageHeaderProps) => (
  <div className="flex items-start justify-between">
    <div className="flex flex-col gap-2">
      {loading ? (
        <>
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-40" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <h1 className="text-heading-xl text-foreground">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <Fragment key={i}>
                  {i > 0 && (
                    <span className="bg-muted-foreground m-2 size-1 rounded-full" />
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-foreground hover:text-foreground font-medium transition-colors hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium">{crumb.label}</span>
                  )}
                </Fragment>
              ))}
            </div>
          )}
        </>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
)

export { PageHeader, type IPageHeaderProps, type IBreadcrumb }
