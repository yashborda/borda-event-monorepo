'use client'

import type { IPermission } from '@pkg/types'
import { Button, Input, Skeleton, Switch } from '@pkg/ui'
import { IconChevronRight, IconSearch } from '@tabler/icons-react'

interface RolePermissionsPanelProps {
  grouped: Record<string, IPermission[]>
  filteredResources: string[]
  selectedIds: Set<string>
  selectedResource: string | null
  search: string
  onSearchChange: (v: string) => void
  onSelectResource: (r: string) => void
  onTogglePerm: (permId: string) => void
  onToggleAllForResource: (resource: string) => void
  disabled?: boolean
  loading?: boolean
  onRefresh?: () => void
}

export function RolePermissionsPanel({
  grouped,
  filteredResources,
  selectedIds,
  selectedResource,
  search,
  onSearchChange,
  onSelectResource,
  onTogglePerm,
  onToggleAllForResource,
  disabled = false,
  loading = false,
  onRefresh,
}: RolePermissionsPanelProps) {
  const selectedPerms = selectedResource
    ? (grouped[selectedResource] ?? [])
    : []
  const allSelectedAssigned =
    selectedPerms.length > 0 &&
    selectedPerms.every((p) => selectedIds.has(p.id))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-md text-foreground">
          Permissions ({selectedIds.size})
        </h2>
        {!disabled && !loading && (
          <div className="flex gap-2">
            {onRefresh && (
              <Button
                size="sm"
                variant="ghost-destructive"
                onClick={onRefresh}
                type="button"
              >
                Refresh permission
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="border-border flex overflow-hidden rounded-lg border">
        {/* Left sidebar */}
        <div className="border-border flex w-56 shrink-0 flex-col border-r">
          <div className="border-border border-b p-2">
            <Input
              placeholder="IconSearch by permission"
              icon={<IconSearch />}
              iconPosition="left"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex flex-col overflow-y-auto">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2.5"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="size-4" />
                  </div>
                ))
              : filteredResources.map((resource) => {
                  const perms = grouped[resource] ?? []
                  const assignedCount = perms.filter((p) =>
                    selectedIds.has(p.id)
                  ).length
                  const isActive = selectedResource === resource
                  return (
                    <button
                      key={resource}
                      type="button"
                      onClick={() => onSelectResource(resource)}
                      className={`flex cursor-pointer items-center justify-between px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-muted text-muted-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span className="text-body-sm font-medium capitalize">
                        {resource}{' '}
                        <span
                          className={
                            isActive
                              ? 'text-muted-foreground/70'
                              : 'text-muted-foreground'
                          }
                        >
                          ({assignedCount}/{perms.length})
                        </span>
                      </span>
                      <IconChevronRight
                        className={`size-4 shrink-0 ${isActive ? 'text-muted-foreground' : 'text-muted-foreground'}`}
                      />
                    </button>
                  )
                })}
          </div>
        </div>

        {/* Right detail panel */}
        <div className="flex flex-1 flex-col">
          {loading ? (
            <>
              <div className="border-border flex items-center justify-between border-b px-5 py-4.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex flex-col">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-5 w-9 rounded-full" />
                  </div>
                ))}
              </div>
            </>
          ) : selectedResource ? (
            <>
              <div className="border-border flex items-center justify-between border-b px-5 py-4.5">
                <span className="text-heading-sm text-foreground capitalize">
                  {selectedResource}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-body-sm text-muted-foreground cursor-pointer"
                    onClick={() =>
                      !disabled && onToggleAllForResource(selectedResource)
                    }
                  >
                    All permission
                  </span>
                  <Switch
                    checked={allSelectedAssigned}
                    onCheckedChange={() =>
                      onToggleAllForResource(selectedResource)
                    }
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                {selectedPerms.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div
                      onClick={() => !disabled && onTogglePerm(p.id)}
                      className="flex cursor-pointer flex-col gap-0.5"
                    >
                      <span className="text-body-md text-foreground">
                        {p.label ?? p.slug}
                      </span>
                      {p.description && (
                        <span className="text-body-sm text-muted-foreground">
                          {p.description}
                        </span>
                      )}
                    </div>
                    <Switch
                      checked={selectedIds.has(p.id)}
                      onCheckedChange={() => onTogglePerm(p.id)}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center">
              <p className="text-body-md">
                Select a group to manage permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
