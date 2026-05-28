'use client'

import type { IBlogCategory } from '@pkg/types'
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
import { TableImage } from '../_components/table-image'
import { DeleteBlogCategoryDialog } from './_components/delete-blog-category-dialog'
import { PermanentDeleteBlogCategoryDialog } from './_components/permanent-delete-blog-category-dialog'
import { RestoreBlogCategoryDialog } from './_components/restore-blog-category-dialog'
import { SyncBlogCategoryDialog } from './_components/sync-blog-category-dialog'

type IStatusFilter = 'all' | 'draft' | 'published'

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
]

const BlogCategoriesPage = () => {
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
    data: categories,
    loading,
    search,
    setSearch,
    setSort,
    reload,
    tableProps,
  } = useTable<IBlogCategory>({
    endpoint: '/api/admin/blog-categories',
    defaultSort: { key: 'updatedAt', dir: 'desc' },
    defaultPageSize: 10,
    extraParams,
  })

  useEffect(() => {
    const handler = () => reload()
    window.addEventListener('blog-categories:reload', handler)
    return () => window.removeEventListener('blog-categories:reload', handler)
  }, [reload])

  const canCreate = can('blog-categories:create')
  const canUpdate = can('blog-categories:update')
  const canDelete = can('blog-categories:delete')
  const canSync = can('blog-categories:revalidate')

  const activeColumns: IColumn<IBlogCategory>[] = [
    {
      key: 'categoryName',
      header: 'Category',
      sorting: true,
      minWidth: 260,
      cell: (category) => (
        <div className="flex items-center gap-3">
          <TableImage
            src={category.bannerImage?.url}
            alt={category.categoryName}
          />
          <div>
            <Link
              href={
                category.deletedAt
                  ? `/blog-categories/${category.id}?deleted=true`
                  : `/blog-categories/${category.id}`
              }
              className="text-body-md text-foreground font-medium hover:underline"
            >
              {category.categoryName}
            </Link>
            <p className="text-muted-foreground text-xs">{category.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 120,
      cell: (category) => {
        const isPublished = category.status === 'published'
        return (
          <Badge variant={isPublished ? 'success' : 'muted'}>
            {isPublished ? 'Published' : 'Draft'}
          </Badge>
        )
      },
    },
    {
      key: 'blogsCount',
      header: 'Blogs',
      minWidth: 80,
      cell: (category) => (
        <span className="text-muted-foreground">{category.blogsCount}</span>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort Order',
      sorting: true,
      minWidth: 100,
      cell: (category) => (
        <span className="text-muted-foreground">{category.sortOrder}</span>
      ),
    },
    {
      key: 'createdByName',
      header: 'Created By',
      minWidth: 140,
      cell: (category) => (
        <span className="text-muted-foreground">{category.createdByName}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sorting: true,
      minWidth: 180,
      cell: (category) => (
        <span className="text-muted-foreground">
          {appDate(category.createdAt)}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      sorting: true,
      minWidth: 180,
      cell: (category) => (
        <span className="text-muted-foreground">
          {appDate(category.updatedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 100,
      cell: (category) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            asChild
          >
            <Link href={`/blog-categories/${category.id}`}>
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
                        id: category.id,
                        name: category.categoryName,
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
                      setDeleteTarget({
                        id: category.id,
                        name: category.categoryName,
                      })
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

  const deletedColumns: IColumn<IBlogCategory>[] = [
    ...activeColumns.slice(0, -1),
    {
      key: 'deletedAt',
      header: 'Deleted At',
      sorting: true,
      minWidth: 180,
      cell: (category) => (
        <span className="text-muted-foreground">
          {category.deletedAt ? appDate(category.deletedAt) : ''}
        </span>
      ),
    },
    {
      key: 'deletedByName',
      header: 'Deleted By',
      minWidth: 160,
      cell: (category) => (
        <span className="text-muted-foreground">{category.deletedByName}</span>
      ),
    },
    {
      key: 'deletedReason',
      header: 'Deletion Reason',
      minWidth: 320,
      cell: (category) => (
        <span className="text-muted-foreground">{category.deletedReason}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 100,
      cell: (category) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            asChild
          >
            <Link href={`/blog-categories/${category.id}?deleted=true`}>
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
                    setRestoreTarget({
                      id: category.id,
                      name: category.categoryName,
                    })
                  }
                >
                  Restore
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() =>
                    setPermanentDeleteTarget({
                      id: category.id,
                      name: category.categoryName,
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
    <PermissionGuard permission="blog-categories:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Blog Categories"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Blog Categories' },
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
                  <Link href="/blog-categories/new">
                    <IconPlus className="size-4" />
                    New Category
                  </Link>
                </Button>
              )}
            </div>
          }
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Input
              placeholder="IconSearch categories…"
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
            data={categories}
            rowKey={(c) => c.id}
            loading={loading}
            emptyMessage={
              includeDeleted
                ? 'No deleted categories found.'
                : 'No blog categories found.'
            }
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteBlogCategoryDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          categoryId={deleteTarget?.id ?? ''}
          categoryName={deleteTarget?.name ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />

        <RestoreBlogCategoryDialog
          open={!!restoreTarget}
          onOpenChange={(open) => !open && setRestoreTarget(null)}
          categoryId={restoreTarget?.id ?? ''}
          categoryName={restoreTarget?.name ?? ''}
          onSuccess={() => {
            setRestoreTarget(null)
            reload()
          }}
        />

        <PermanentDeleteBlogCategoryDialog
          open={!!permanentDeleteTarget}
          onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
          categoryId={permanentDeleteTarget?.id ?? ''}
          categoryName={permanentDeleteTarget?.name ?? ''}
          onSuccess={() => {
            setPermanentDeleteTarget(null)
            reload()
          }}
        />

        <SyncBlogCategoryDialog
          open={!!syncTarget}
          onOpenChange={(open) => !open && setSyncTarget(null)}
          mode={syncTarget?.mode ?? 'single'}
          categoryId={syncTarget?.id}
          categoryName={syncTarget?.name}
          onSuccess={() => setSyncTarget(null)}
        />
      </div>
    </PermissionGuard>
  )
}

export default BlogCategoriesPage
