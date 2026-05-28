import { Skeleton } from '@pkg/ui'

type IBlogTagFormSkeletonProps = {
  showFooter?: boolean
}

const BlogTagFormSkeleton = ({ showFooter }: IBlogTagFormSkeletonProps) => (
  <div className="flex flex-col gap-6">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Excerpt */}
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-20 w-full" />
    </div>

    {/* Footer */}
    {showFooter && (
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>
    )}
  </div>
)

export { BlogTagFormSkeleton }
