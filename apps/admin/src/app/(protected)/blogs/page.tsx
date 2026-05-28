'use client'

import type {
  IBlogAuthor,
  IBlogCategory,
  IBlogListItem,
  IBlogTag,
} from '@pkg/types'
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
  IconStar,
} from '@tabler/icons-react'

import Link from 'next/link'

import { useEffect, useMemo, useState } from 'react'

import { apiFetch } from '@/lib/api-client'

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
import { TableImage } from '../_components/table-image'
import { DeleteBlogDialog } from './_components/delete-blog-dialog'
import { PermanentDeleteBlogDialog } from './_components/permanent-delete-blog-dialog'
import { PublishBlogDialog } from './_components/publish-blog-dialog'
import { RestoreBlogDialog } from './_components/restore-blog-dialog'
import { SyncBlogDialog } from './_components/sync-blog-dialog'

type IStatusFilter = 'all' | 'draft' | 'published'

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
]

const statusBadgeVariant = (status: string): 'muted' | 'success' => {
  if (status === 'published') return 'success'
  return 'muted'
}

const BlogsPage = () => {
  const { can } = usePermissions()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    title: string
  } | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<{
    id: string
    title: string
  } | null>(null)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{
    id: string
    title: string
  } | null>(null)
  const [publishTarget, setPublishTarget] = useState<{
    id: string
    title: string
    status: string
  } | null>(null)
  const [syncTarget, setSyncTarget] = useState<{
    mode: 'single' | 'all'
    id?: string
    title?: string
  } | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [statusFilter, setStatusFilter] = useState<IStatusFilter>('all')
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [tagId, setTagId] = useState<string | undefined>()
  const [authorId, setAuthorId] = useState<string | undefined>()
  const [categories, setCategories] = useState<IBlogCategory[]>([])
  const [tags, setTags] = useState<IBlogTag[]>([])
  const [authors, setAuthors] = useState<IBlogAuthor[]>([])

  useEffect(() => {
    apiFetch<{ data: IBlogCategory[] }>(
      '/api/admin/blog-categories?limit=100&includeDeleted=false&statusFilter=published'
    ).then((res) => setCategories(res.data))
    apiFetch<{ data: IBlogTag[] }>(
      '/api/admin/blog-tags?limit=100&includeDeleted=false&statusFilter=published'
    ).then((res) => setTags(res.data))
    apiFetch<{ data: IBlogAuthor[] }>(
      '/api/admin/blog-authors?limit=100&includeDeleted=false&statusFilter=active'
    ).then((res) => setAuthors(res.data))
  }, [])

  const extraParams = useMemo(() => {
    const params: Record<string, string> = {
      includeDeleted: includeDeleted ? 'true' : 'false',
    }
    if (statusFilter !== 'all') params.statusFilter = statusFilter
    if (categoryId) params.categoryId = categoryId
    if (tagId) params.tagId = tagId
    if (authorId) params.authorId = authorId
    return params
  }, [includeDeleted, statusFilter, categoryId, tagId, authorId])

  const {
    data: blogs,
    loading,
    search,
    setSearch,
    setSort,
    reload,
    tableProps,
  } = useTable<IBlogListItem>({
    endpoint: '/api/admin/blogs',
    defaultSort: { key: 'updatedAt', dir: 'desc' },
    defaultPageSize: 10,
    extraParams,
  })

  useEffect(() => {
    const handler = () => reload()
    window.addEventListener('blogs:reload', handler)
    return () => window.removeEventListener('blogs:reload', handler)
  }, [reload])

  const canCreate = can('blogs:create')
  const canUpdate = can('blogs:update')
  const canDelete = can('blogs:delete')
  const canPublish = can('blogs:publish')
  const canSync = can('blogs:revalidate')

  const activeColumns: IColumn<IBlogListItem>[] = [
    {
      key: 'title',
      header: 'Title',
      sorting: true,
      minWidth: 450,
      cell: (b) => (
        <div className="flex items-center gap-3">
          <TableImage
            src={b.featuredImage?.url}
            alt={b.title}
            className="h-10 w-16 rounded"
          />
          <div>
            <Link
              href={
                b.deletedAt ? `/blogs/${b.id}?deleted=true` : `/blogs/${b.id}`
              }
              className="text-body-md text-foreground font-medium hover:underline"
            >
              {b.title}
            </Link>
            <p className="text-muted-foreground text-xs">{b.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 140,
      cell: (b) => (
        <div className="flex flex-col gap-1">
          <Badge variant={statusBadgeVariant(b.status)}>
            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      className: 'text-center',
      minWidth: 90,
      cell: (b) =>
        b.isFeatured ? (
          <div className="flex justify-center">
            <IconStar className="size-4 fill-yellow-400 text-yellow-400" />
          </div>
        ) : null,
    },
    {
      key: 'author',
      header: 'Author',
      minWidth: 160,
      cell: (b) => (
        <span className="text-muted-foreground">
          {b.author?.fullName ?? '—'}
        </span>
      ),
    },
    {
      key: 'categories',
      header: 'Categories',
      minWidth: 180,
      cell: (b) =>
        b.categories.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {b.categories.map((c) => (
              <Badge key={c.id} variant="muted">
                {c.categoryName}
              </Badge>
            ))}
          </div>
        ) : null,
    },
    {
      key: 'tags',
      header: 'Tags',
      minWidth: 180,
      cell: (b) =>
        b.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {b.tags.map((t) => (
              <Badge key={t.id} variant="muted">
                {t.name}
              </Badge>
            ))}
          </div>
        ) : null,
    },
    {
      key: 'publishedAt',
      header: 'Published At',
      sorting: true,
      minWidth: 180,
      cell: (b) => (
        <span className="text-muted-foreground">
          {b.publishedAt ? appDate(b.publishedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'viewCount',
      header: 'Views',
      sorting: true,
      minWidth: 80,
      cell: (b) => (
        <span className="text-muted-foreground">
          {b.viewCount?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      key: 'likeCount',
      header: 'Likes',
      sorting: true,
      minWidth: 80,
      cell: (b) => (
        <span className="text-muted-foreground">
          {b.likeCount?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      key: 'createdByName',
      header: 'Created By',
      minWidth: 140,
      cell: (b) => (
        <span className="text-muted-foreground">{b.createdByName}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sorting: true,
      minWidth: 180,
      cell: (b) => (
        <span className="text-muted-foreground">{appDate(b.createdAt)}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      sorting: true,
      minWidth: 180,
      cell: (b) => (
        <span className="text-muted-foreground">{appDate(b.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 100,
      cell: (b) => {
        const canPublishThis = canPublish && b.status === 'draft'
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost-muted"
              size="sm"
              className="size-8 p-0"
              asChild
            >
              <Link href={`/blogs/${b.id}`}>
                {canUpdate ? (
                  <IconPencil className="size-4" />
                ) : (
                  <IconEye className="size-4" />
                )}
              </Link>
            </Button>
            {(canPublishThis || canDelete || canSync) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost-muted"
                    size="sm"
                    className="size-8 p-0"
                  >
                    <IconDots className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canPublishThis && (
                    <DropdownMenuItem
                      onClick={() =>
                        setPublishTarget({
                          id: b.id,
                          title: b.title,
                          status: b.status,
                        })
                      }
                    >
                      Publish
                    </DropdownMenuItem>
                  )}
                  {canSync && (
                    <DropdownMenuItem
                      onClick={() =>
                        setSyncTarget({
                          mode: 'single',
                          id: b.id,
                          title: b.title,
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
                        setDeleteTarget({ id: b.id, title: b.title })
                      }
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      },
    },
  ]

  const deletedColumns: IColumn<IBlogListItem>[] = [
    ...activeColumns.slice(0, -1),
    {
      key: 'deletedAt',
      header: 'Deleted At',
      sorting: true,
      minWidth: 180,
      cell: (b) => (
        <span className="text-muted-foreground">
          {b.deletedAt ? appDate(b.deletedAt) : ''}
        </span>
      ),
    },
    {
      key: 'deletedByName',
      header: 'Deleted By',
      minWidth: 140,
      cell: (b) => (
        <span className="text-muted-foreground">{b.deletedByName}</span>
      ),
    },
    {
      key: 'deletedReason',
      header: 'Deletion Reason',
      minWidth: 360,
      cell: (b) => (
        <span className="text-muted-foreground">{b.deletedReason}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 100,
      cell: (b) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            asChild
          >
            <Link href={`/blogs/${b.id}?deleted=true`}>
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
                  onClick={() => setRestoreTarget({ id: b.id, title: b.title })}
                >
                  Restore
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() =>
                    setPermanentDeleteTarget({ id: b.id, title: b.title })
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
    <PermissionGuard permission="blogs:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Blogs"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blogs' },
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
                  <Link href="/blogs/new">
                    <IconPlus className="size-4" />
                    New Blog Post
                  </Link>
                </Button>
              )}
            </div>
          }
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Input
              placeholder="IconSearch blogs…"
              icon={<IconSearch />}
              iconPosition="left"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="All statuses"
              options={STATUS_OPTIONS.filter((o) => o.value !== 'all')}
              value={statusFilter !== 'all' ? statusFilter : undefined}
              onChange={(v) => setStatusFilter((v as IStatusFilter) ?? 'all')}
              clearable
              className="w-44"
            />
            <Select
              placeholder="All categories"
              options={categories.map((c) => ({
                label: c.categoryName,
                value: c.id,
              }))}
              value={categoryId}
              onChange={(v) => setCategoryId(v ?? undefined)}
              clearable
              className="w-44"
            />
            <Select
              placeholder="All tags"
              options={tags.map((t) => ({ label: t.name, value: t.id }))}
              value={tagId}
              onChange={(v) => setTagId(v ?? undefined)}
              clearable
              className="w-44"
            />
            <Select
              placeholder="All authors"
              options={authors.map((a) => ({ label: a.fullName, value: a.id }))}
              value={authorId}
              onChange={(v) => setAuthorId(v ?? undefined)}
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
            data={blogs}
            rowKey={(b) => b.id}
            loading={loading}
            emptyMessage={
              includeDeleted
                ? 'No deleted blog posts found.'
                : 'No blog posts found.'
            }
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteBlogDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          blogId={deleteTarget?.id ?? ''}
          blogTitle={deleteTarget?.title ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreBlogDialog
          open={!!restoreTarget}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          blogId={restoreTarget?.id ?? ''}
          blogTitle={restoreTarget?.title ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />

        <PermanentDeleteBlogDialog
          open={!!permanentDeleteTarget}
          onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
          blogId={permanentDeleteTarget?.id ?? ''}
          blogTitle={permanentDeleteTarget?.title ?? ''}
          onSuccess={() => {
            setPermanentDeleteTarget(null)
            reload()
          }}
        />

        <PublishBlogDialog
          open={!!publishTarget}
          onOpenChange={(open) => !open && setPublishTarget(null)}
          blogId={publishTarget?.id ?? ''}
          blogTitle={publishTarget?.title ?? ''}
          currentStatus={publishTarget?.status ?? ''}
          onSuccess={() => {
            setPublishTarget(null)
            reload()
          }}
        />

        <SyncBlogDialog
          open={!!syncTarget}
          onOpenChange={(open) => !open && setSyncTarget(null)}
          mode={syncTarget?.mode ?? 'single'}
          blogId={syncTarget?.id}
          blogTitle={syncTarget?.title}
          onSuccess={() => setSyncTarget(null)}
        />
      </div>
    </PermissionGuard>
  )
}

export default BlogsPage
