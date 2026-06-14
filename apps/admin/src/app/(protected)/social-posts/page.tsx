'use client'

import type { ISocialPost } from '@pkg/types'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
} from '@pkg/ui'
import {
  IconDots,
  IconExternalLink,
  IconPencil,
  IconPlus,
} from '@tabler/icons-react'

import Link from 'next/link'

import { useMemo, useState } from 'react'

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
import { DeleteSocialPostDialog } from './_components/delete-social-post-dialog'

type IPlatformFilter = 'all' | 'instagram' | 'facebook' | 'youtube'

const SocialPostsPage = () => {
  const { can } = usePermissions()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    label: string
  } | null>(null)
  const [platform, setPlatform] = useState<IPlatformFilter>('all')

  const extraParams = useMemo(() => {
    const p: Record<string, string> = {}
    if (platform !== 'all') p.platform = platform
    return p
  }, [platform])

  const { data, loading, reload, tableProps } = useTable<ISocialPost>({
    endpoint: '/api/admin/social-posts',
    defaultSort: { key: 'sortOrder', dir: 'asc' },
    defaultPageSize: 10,
    extraParams,
  })

  const canCreate = can('social-posts:create')
  const canUpdate = can('social-posts:update')
  const canDelete = can('social-posts:delete')

  const columns: IColumn<ISocialPost>[] = [
    {
      key: 'platform',
      header: 'Platform',
      minWidth: 120,
      cell: (p) => <Badge variant="secondary">{p.platform}</Badge>,
    },
    {
      key: 'postUrl',
      header: 'Post',
      minWidth: 280,
      cell: (p) => (
        <a
          href={p.postUrl}
          target="_blank"
          rel="noreferrer"
          className="text-body-md text-foreground inline-flex max-w-xs items-center gap-1 truncate hover:underline"
        >
          <span className="truncate">{p.caption || p.postUrl}</span>
          <IconExternalLink className="size-3.5 shrink-0" />
        </a>
      ),
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      minWidth: 100,
      cell: (p) =>
        p.isFeatured ? (
          <Badge variant="success">Featured</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'sortOrder',
      header: 'Sort',
      sorting: true,
      minWidth: 80,
      cell: (p) => <span className="text-muted-foreground">{p.sortOrder}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sorting: true,
      minWidth: 180,
      cell: (p) => (
        <span className="text-muted-foreground">{appDate(p.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      className: 'text-right',
      minWidth: 100,
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          {canUpdate && (
            <Button
              variant="ghost-muted"
              size="sm"
              className="size-8 p-0"
              asChild
            >
              <Link href={`/social-posts/${p.id}`}>
                <IconPencil className="size-4" />
              </Link>
            </Button>
          )}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost-muted" size="sm" className="size-8 p-0">
                  <IconDots className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() =>
                    setDeleteTarget({ id: p.id, label: p.caption || p.postUrl })
                  }
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
    },
  ]

  return (
    <PermissionGuard permission="social-posts:read" redirectTo="/dashboard">
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Social Posts"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Social Posts' },
          ]}
          action={
            canCreate && (
              <Button asChild>
                <Link href="/social-posts/new">
                  <IconPlus className="size-4" />
                  New Post
                </Link>
              </Button>
            )
          }
        />

        <DataTableRoot>
          <DataTableToolbar className="gap-4">
            <Select
              placeholder="All platforms"
              options={[
                { label: 'Instagram', value: 'instagram' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'YouTube', value: 'youtube' },
              ]}
              value={platform !== 'all' ? platform : undefined}
              onChange={(v) => setPlatform((v as IPlatformFilter) ?? 'all')}
              clearable
              className="w-44"
            />
          </DataTableToolbar>
          <DataTable
            columns={columns}
            data={data}
            rowKey={(p) => p.id}
            loading={loading}
            emptyMessage="No social posts found."
            {...tableProps}
          />
        </DataTableRoot>

        <DeleteSocialPostDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          postId={deleteTarget?.id ?? ''}
          postLabel={deleteTarget?.label ?? ''}
          onSuccess={() => {
            setDeleteTarget(null)
            reload()
          }}
        />
      </div>
    </PermissionGuard>
  )
}

export default SocialPostsPage
