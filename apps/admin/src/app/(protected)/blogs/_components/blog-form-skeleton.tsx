import { Skeleton } from '@pkg/ui'

type IBlogFormSkeletonProps = {
  showFooter?: boolean
}

const BlogFormSkeleton = ({ showFooter }: IBlogFormSkeletonProps) => (
  <div className="flex flex-col gap-8">
    {/* Basic Info */}
    <div className="space-y-4">
      <Skeleton className="h-4 w-20" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>

    {/* Content */}
    <div className="space-y-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-64 w-full" />
    </div>

    {/* Media */}
    <div className="space-y-4">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-32 w-32" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Taxonomy */}
    <div className="space-y-4">
      <Skeleton className="h-4 w-20" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>

    {/* Publication */}
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-9 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>

    {/* SEO */}
    <div className="space-y-4">
      <Skeleton className="h-4 w-8" />
      <div className="grid gap-4 sm:grid-cols-2">
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
    </div>

    {showFooter && (
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
    )}
  </div>
)

export { BlogFormSkeleton }
