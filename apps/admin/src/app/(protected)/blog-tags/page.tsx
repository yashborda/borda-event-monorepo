'use client'

import type { IBlogTag } from '@pkg/types'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Select,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@pkg/ui'
import {
  IconDots,
  IconEye,
  IconPencil,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

import Link from 'next/link'

import { useEffect, useMemo, useState } from 'react'

import { appDate } from '@/utils/date.helper'

import { usePermissions } from '@/hooks/use-permissions'
import { useTable } from '@/hooks/use-table'

import {
  DataTable,
  DataTableRoot,
  DataTableToolbar,
  type IColumn,
} from '../_components/data-table'
import { PageHeader } from '../_components/page-header'
import { PermissionGuard } from '../_components/permission-guard'
import { DeleteBlogTagDialog } from './_components/delete-blog-tag-dialog'
import { PermanentDeleteBlogTagDialog } from './_components/permanent-delete-blog-tag-dialog'
import { RestoreBlogTagDialog } from './_components/restore-blog-tag-dialog'
import { SyncBlogTagDialog } from './_components/sync-blog-tag-dialog'

type IStatusFilter = 'all' | 'draft' | 'published'

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
]

const BlogTagsPage = () => {
  const { can } = usePermissions()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [syncTarget, setSyncTarget] = useState<{
    mode: 'single' | 'all'
    id?: string
    name?: string
  } | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [statusFilter, setStatusFilter] = useState<IStatusFilter>('all')

  const extraParams = useMemo(() => {
    const params: Record<string, string> = {
      includeDeleted: includeDeleted ? 'true' : 'false',
    }
    if (statusFilter !== 'all') params.statusFilter = statusFilter
    return params
  }, [includeDeleted, statusFilter])

  const {
    data: tags,
    loading,
    search,
    setSearch,
    setSort,
    reload,
    tableProps,
  } = useTable<IBlogTag>({
    endpoint: '/api/admin/blog-tags',
    defaultSort: { key: 'updatedAt', dir: 'desc' },
    defaultPageSize: 10,
    extraParams,
  })

  useEffect(() => {
    const handler = () => reload()
    window.addEventListener('blog-tags:reload', handler)
    return () => window.removeEventListener('blog-tags:reload', handler)
  }, [reload])

  const canCreate = can('blog-tags:create')
  const canUpdate = can('blog-tags:update')
  const canDelete = can('blog-tags:delete')
  const canSync = can('blog-tags:revalidate')

  const activeColumns: IColumn<IBlogTag>[] = [
    {
      key: 'name',
      header: 'Name',
      sorting: true,
      minWidth: 200,
      cell: (tag) => (
        <div>
          <Link
            href={
              tag.deletedAt
                ? `/blog-tags/${tag.id}?deleted=true`
                : `/blog-tags/${tag.id}`
            }
            className="text-body-md text-foreground font-medium hover:underline"
          >
            {tag.name}
          </Link>
          <p className="text-muted-foreground text-xs">{tag.slug}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 120,
      cell: (tag) => {
        const isPublished = tag.status === 'published'
        return (
          <Badge variant={isPublished ? 'success' : 'muted'}>
            {isPublished ? 'Published' : 'Draft'}
          </Badge>
        )
      },
    },
    {
      key: 'sortOrder',
      header: 'Sort Order',
      sorting: true,
      minWidth: 120,
      cell: (tag) => (
        <span className="text-muted-foreground">{tag.sortOrder}</span>
      ),
    },
    {
      key: 'blogsCount',
      header: 'Blogs',
      minWidth: 80,
      cell: (tag) => (
        <span className="text-muted-foreground">{tag.blogsCount}</span>
      ),
    },
    {
      key: 'createdByName',
      header: 'Created By',
      minWidth: 140,
      cell: (tag) => (
        <span className="text-muted-foreground">{tag.createdByName}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sorting: true,
      minWidth: 180,
      cell: (tag) => (
        <span className="text-muted-foreground">{appDate(tag.createdAt)}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      sorting: true,
      minWidth: 180,
      cell: (tag) => (
        <span className="text-muted-foreground">{appDate(tag.updatedAt)}</span>
      ),
    },
  ]

  const deletedColumns: IColumn<IBlogTag>[] = [
    {
      key: 'deletedAt',
      header: 'Deleted At',
      sorting: true,
      minWidth: 180,
      cell: (tag) => (
        <span className="text-muted-foreground">
          {tag.deletedAt ? appDate(tag.deletedAt) : ''}
        </span>
      ),
    },
    {
      key: 'deletedByName',
      header: 'Deleted By',
      minWidth: 140,
      cell: (tag) => (
        <span className="text-muted-foreground">{tag.deletedByName}</span>
      ),
    },
    {
      key: 'deletedReason',
      header: 'Deletion Reason',
      minWidth: 300,
      cell: (tag) => (
        <span className="text-muted-foreground">{tag.deletedReason}</span>
      ),
    },
  ]

  const actionsColumn: IColumn<IBlogTag> = {
    key: 'actions',
    header: 'Actions',
    sticky: 'right',
    className: 'text-right',
    minWidth: 100,
    cell: (tag) => {
      const isDeleted = !!tag.deletedAt
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            asChild
          >
            <Link
              href={
                isDeleted
                  ? `/blog-tags/${tag.id}?deleted=true`
                  : `/blog-tags/${tag.id}`
              }
            >
              {canUpdate && !isDeleted ? (
                <IconPencil className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </Link>
          </Button>
          {(canDelete || canSync) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost-muted" size="sm" className="size-8 p-0">
                  <IconDots className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isDeleted ? (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        setRestoreTarget({ id: tag.id, name: tag.name })
                      }
                    >
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() =>
                        setPermanentDeleteTarget({ id: tag.id, name: tag.name })
                      }
                    >
                      Delete Permanently
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    {canSync && (
                      <DropdownMenuItem
                        onClick={() =>
                          setSyncTarget({
                            mode: 'single',
                            id: tag.id,
                            name: tag.name,
                          })
                        }
                      >
                        Sync
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          setDeleteTarget({ id: tag.id, name: tag.name })
                        }
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )
    },
  }

  const columns: IColumn<IBlogTag>[] = [
    ...activeColumns,
    ...(includeDeleted ? deletedColumns : []),
    actionsColumn,
  ]

  return (
    <PermissionGuard permission="blog-tags:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Blog Tags"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blog Tags' },
          ]}
          action={
            <div className="flex items-center gap-2">
              {canSync && (
                <Button
                  variant="outline-muted"
                  onClick={() => setSyncTarget({ mode: 'all' })}
                >
                  Sync All
                </Button>
              )}
              {canCreate && (
                <Button asChild>
                  <Link href="/blog-tags/new">
                    <IconPlus className="size-4" />
                    New IconTag
                  </Link>
                </Button>
              )}
            </div>
          }
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Input
              placeholder="IconSearch tags…"
              icon={<IconSearch />}
              iconPosition="left"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="All statuses"
              options={STATUS_OPTIONS}
              value={statusFilter !== 'all' ? statusFilter : undefined}
              onChange={(v) => setStatusFilter((v as IStatusFilter) ?? 'all')}
              clearable
              className="w-44"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-auto">
                    <Switch
                      checked={includeDeleted}
                      onCheckedChange={(v) => {
                        setIncludeDeleted(v)
                        setSort({
                          key: v ? 'deletedAt' : 'updatedAt',
                          dir: 'desc',
                        })
                      }}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Show Deleted</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DataTableToolbar>
          <DataTable
            columns={columns}
            data={tags}
            rowKey={(t) => t.id}
            loading={loading}
            emptyMessage={
              includeDeleted ? 'No deleted tags found.' : 'No blog tags found.'
            }
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteBlogTagDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          tagId={deleteTarget?.id ?? ''}
          tagName={deleteTarget?.name ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreBlogTagDialog
          open={!!restoreTarget}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          tagId={restoreTarget?.id ?? ''}
          tagName={restoreTarget?.name ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />

        <PermanentDeleteBlogTagDialog
          open={!!permanentDeleteTarget}
          onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
          tagId={permanentDeleteTarget?.id ?? ''}
          tagName={permanentDeleteTarget?.name ?? ''}
          onSuccess={() => {
            setPermanentDeleteTarget(null)
            reload()
          }}
        />

        <SyncBlogTagDialog
          open={!!syncTarget}
          onOpenChange={(open) => !open && setSyncTarget(null)}
          mode={syncTarget?.mode ?? 'single'}
          tagId={syncTarget?.id}
          tagName={syncTarget?.name}
          onSuccess={() => setSyncTarget(null)}
        />
      </div>
    </PermissionGuard>
  )
}

export default BlogTagsPage
