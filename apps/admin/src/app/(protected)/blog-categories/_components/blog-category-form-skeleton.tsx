import { Skeleton } from '@pkg/ui'

type IBlogCategoryFormSkeletonProps = {
  showFooter?: boolean
}

const BlogCategoryFormSkeleton = ({
  showFooter,
}: IBlogCategoryFormSkeletonProps) => (
  <div className="flex flex-col gap-6">
    {/* Basic Info section */}
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-24" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
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
    </div>

    {/* Banner Image section */}
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-32 w-full rounded-md" />
    </div>

    {/* Excerpt */}
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-20 w-full" />
    </div>

    {/* SEO section */}
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
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

export { BlogCategoryFormSkeleton }
