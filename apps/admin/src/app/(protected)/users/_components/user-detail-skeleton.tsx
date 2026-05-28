import { Skeleton } from '@pkg/ui'

type IUserDetailSkeletonProps = {
  showFooter?: boolean
}

const UserDetailSkeleton = ({ showFooter }: IUserDetailSkeletonProps) => (
  <div className="flex flex-col gap-6">
    {/* Row 1: Full name + Email */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Row 2: Roles */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Row 3: Status */}
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-9 rounded-full" />
      <Skeleton className="h-4 w-12" />
    </div>

    {/* Row 4: Buttons */}
    {showFooter && (
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>
    )}
  </div>
)

export { UserDetailSkeleton }
