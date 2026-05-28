'use client'

import type { IBlogAuthor } from '@pkg/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { DeleteBlogAuthorDialog } from './_components/delete-blog-author-dialog'
import { PermanentDeleteBlogAuthorDialog } from './_components/permanent-delete-blog-author-dialog'
import { RestoreBlogAuthorDialog } from './_components/restore-blog-author-dialog'
import { SyncBlogAuthorDialog } from './_components/sync-blog-author-dialog'

type IStatusFilter = 'all' | 'active' | 'inactive'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const BlogAuthorsPage = () => {
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
    data: authors,
    loading,
    search,
    setSearch,
    setSort,
    reload,
    tableProps,
  } = useTable<IBlogAuthor>({
    endpoint: '/api/admin/blog-authors',
    defaultSort: { key: 'updatedAt', dir: 'desc' },
    defaultPageSize: 10,
    extraParams,
  })

  useEffect(() => {
    const handler = () => reload()
    window.addEventListener('blog-authors:reload', handler)
    return () => window.removeEventListener('blog-authors:reload', handler)
  }, [reload])

  const canCreate = can('blog-authors:create')
  const canUpdate = can('blog-authors:update')
  const canDelete = can('blog-authors:delete')
  const canSync = can('blog-authors:revalidate')

  const activeColumns: IColumn<IBlogAuthor>[] = [
    {
      key: 'fullName',
      header: 'Author',
      sorting: true,
      minWidth: 280,
      cell: (author) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={author.avatar?.url ?? undefined}
              alt={author.fullName}
            />
            <AvatarFallback>
              {author.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={
                author.deletedAt
                  ? `/blog-authors/${author.id}?deleted=true`
                  : `/blog-authors/${author.id}`
              }
              className="text-body-md text-foreground font-medium hover:underline"
            >
              {author.fullName}
            </Link>
            <p className="text-muted-foreground text-xs">{author.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 100,
      cell: (author) => (
        <Badge variant={author.status === 'active' ? 'success' : 'muted'}>
          {author.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'numberOfBlogsWritten',
      header: 'Blogs',
      minWidth: 80,
      cell: (author) => (
        <span className="text-muted-foreground">
          {author.numberOfBlogsWritten}
        </span>
      ),
    },
    {
      key: 'createdByName',
      header: 'Created By',
      minWidth: 160,
      cell: (author) => (
        <span className="text-muted-foreground">{author.createdByName}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sorting: true,
      minWidth: 180,
      cell: (author) => (
        <span className="text-muted-foreground">
          {appDate(author.createdAt)}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      sorting: true,
      minWidth: 180,
      cell: (author) => (
        <span className="text-muted-foreground">
          {appDate(author.updatedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 100,
      cell: (author) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            asChild
          >
            <Link href={`/blog-authors/${author.id}`}>
              {canUpdate ? (
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
                {canSync && (
                  <DropdownMenuItem
                    onClick={() =>
                      setSyncTarget({
                        mode: 'single',
                        id: author.id,
                        name: author.fullName,
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
                      setDeleteTarget({ id: author.id, name: author.fullName })
                    }
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
    },
  ]

  const deletedColumns: IColumn<IBlogAuthor>[] = [
    ...activeColumns.slice(0, -1),
    {
      key: 'deletedAt',
      header: 'Deleted At',
      sorting: true,
      minWidth: 180,
      cell: (author) => (
        <span className="text-muted-foreground">
          {author.deletedAt ? appDate(author.deletedAt) : ''}
        </span>
      ),
    },
    {
      key: 'deletedByName',
      header: 'Deleted By',
      minWidth: 160,
      cell: (author) => (
        <span className="text-muted-foreground">{author.deletedByName}</span>
      ),
    },
    {
      key: 'deletedReason',
      header: 'Deletion Reason',
      minWidth: 320,
      cell: (author) => (
        <span className="text-muted-foreground">{author.deletedReason}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 100,
      cell: (author) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            asChild
          >
            <Link href={`/blog-authors/${author.id}?deleted=true`}>
              <IconEye className="size-4" />
            </Link>
          </Button>
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost-muted" size="sm" className="size-8 p-0">
                  <IconDots className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    setRestoreTarget({ id: author.id, name: author.fullName })
                  }
                >
                  Restore
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() =>
                    setPermanentDeleteTarget({
                      id: author.id,
                      name: author.fullName,
                    })
                  }
                >
                  Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
    },
  ]

  const columns = includeDeleted ? deletedColumns : activeColumns

  return (
    <PermissionGuard permission="blog-authors:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Blog Authors"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blog Authors' },
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
                  <Link href="/blog-authors/new">
                    <IconPlus className="size-4" />
                    New Author
                  </Link>
                </Button>
              )}
            </div>
          }
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Input
              placeholder="IconSearch authors…"
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
            data={authors}
            rowKey={(a) => a.id}
            loading={loading}
            emptyMessage={
              includeDeleted
                ? 'No deleted authors found.'
                : 'No blog authors found.'
            }
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteBlogAuthorDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          authorId={deleteTarget?.id ?? ''}
          authorName={deleteTarget?.name ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreBlogAuthorDialog
          open={!!restoreTarget}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          authorId={restoreTarget?.id ?? ''}
          authorName={restoreTarget?.name ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />

        <PermanentDeleteBlogAuthorDialog
          open={!!permanentDeleteTarget}
          onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
          authorId={permanentDeleteTarget?.id ?? ''}
          authorName={permanentDeleteTarget?.name ?? ''}
          onSuccess={() => {
            setPermanentDeleteTarget(null)
            reload()
          }}
        />

        <SyncBlogAuthorDialog
          open={!!syncTarget}
          onOpenChange={(open) => !open && setSyncTarget(null)}
          mode={syncTarget?.mode ?? 'single'}
          authorId={syncTarget?.id}
          authorName={syncTarget?.name}
          onSuccess={() => setSyncTarget(null)}
        />
      </div>
    </PermissionGuard>
  )
}

export default BlogAuthorsPage
