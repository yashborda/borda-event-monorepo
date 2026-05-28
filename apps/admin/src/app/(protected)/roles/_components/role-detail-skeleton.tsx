import { Skeleton } from '@pkg/ui'

import { RolePermissionsPanel } from './role-permissions-panel'

type IRoleDetailSkeletonProps = {
  showFooter?: boolean
}

const RoleDetailSkeleton = ({ showFooter }: IRoleDetailSkeletonProps) => (
  <div className="flex flex-col gap-6">
    {/* Name + Slug */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Permissions panel */}
    <RolePermissionsPanel
      grouped={{}}
      filteredResources={[]}
      selectedIds={new Set()}
      selectedResource={null}
      search=""
      onSearchChange={() => {}}
      onSelectResource={() => {}}
      onTogglePerm={() => {}}
      onToggleAllForResource={() => {}}
      loading
    />

    {/* Buttons */}
    {showFooter && (
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>
    )}
  </div>
)

export { RoleDetailSkeleton }
