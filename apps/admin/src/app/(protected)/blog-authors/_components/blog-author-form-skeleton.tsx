import { Skeleton } from '@pkg/ui'

type IBlogAuthorFormSkeletonProps = {
  showFooter?: boolean
}

const BlogAuthorFormSkeleton = ({
  showFooter,
}: IBlogAuthorFormSkeletonProps) => (
  <div className="flex flex-col gap-6">
    {/* Basic Info */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Avatar */}
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-32 w-32 rounded-md" />
    </div>

    {/* Bio */}
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-8" />
      <Skeleton className="h-24 w-full" />
    </div>

    {/* Social Links */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-18" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Status */}
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-9 rounded-full" />
      <Skeleton className="h-4 w-12" />
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

export { BlogAuthorFormSkeleton }
