import { Button, Select, Skeleton, cn } from '@pkg/ui'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconSelector,
} from '@tabler/icons-react'

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

type ISortDir = 'asc' | 'desc'

type ISort = {
  key: string
  dir: ISortDir
}

type IColumn<T> = {
  key: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  className?: string
  sorting?: boolean
  minWidth?: number | string
  sticky?: 'left' | 'right'
}

type IDataTableProps<T> = {
  columns: IColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyMessage?: string
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  sort?: ISort | null
  onSortChange?: (key: string, dir: ISortDir) => void
  maxHeight?: string
  /** When set, clicking a row invokes this. Cells with interactive controls
   *  should call stopPropagation to opt out. */
  onRowClick?: (row: T) => void
}

const SortIcon = ({
  columnKey,
  sort,
}: {
  columnKey: string
  sort?: ISort | null
}) => {
  if (!sort || sort.key !== columnKey)
    return <IconSelector className="size-3.5" />
  return sort.dir === 'asc' ? (
    <IconChevronUp className="size-3.5" />
  ) : (
    <IconChevronDown className="size-3.5" />
  )
}

const DataTable = <T,>({
  columns,
  data,
  rowKey,
  loading,
  emptyMessage = 'No results found.',
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sort,
  onSortChange,
  maxHeight = '615px',
  onRowClick,
}: IDataTableProps<T>) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize

  const handleSort = (col: IColumn<T>) => {
    if (!col.sorting || !onSortChange) return
    const nextDir: ISortDir =
      sort?.key === col.key
        ? sort.dir === 'asc'
          ? 'desc'
          : 'asc'
        : (sort?.dir ?? 'asc')
    onSortChange(col.key, nextDir)
  }

  return (
    <>
      {/* Table */}
      <div
        className="overflow-auto"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className="min-w-full">
          <thead className="bg-muted sticky top-0 z-20 h-11.25 min-h-11.25">
            <tr className="border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'bg-muted text-body-sm text-muted-foreground px-4 py-3 text-left font-semibold',
                    col.sticky === 'right' &&
                      'before:to-muted sticky right-0 z-20 before:pointer-events-none before:absolute before:top-0 before:right-full before:h-full before:w-7 before:bg-linear-to-r before:from-transparent',
                    col.sticky === 'left' &&
                      'after:to-muted sticky left-0 z-20 after:pointer-events-none after:absolute after:top-0 after:left-full after:h-full after:w-7 after:bg-linear-to-l after:from-transparent',
                    col.className
                  )}
                  style={{
                    ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                  }}
                >
                  {col.sorting ? (
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-1 font-semibold"
                      onClick={() => handleSort(col)}
                    >
                      {col.header}
                      <SortIcon columnKey={col.key} sort={sort} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="border-border border-t">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3',
                        col.sticky === 'right' &&
                          'before:to-background bg-background sticky right-0 z-10 before:pointer-events-none before:absolute before:top-0 before:right-full before:h-full before:w-7 before:bg-linear-to-r before:from-transparent',
                        col.sticky === 'left' &&
                          'after:to-background bg-background sticky left-0 z-10 after:pointer-events-none after:absolute after:top-0 after:left-full after:h-full after:w-7 after:bg-linear-to-l after:from-transparent',
                        col.className
                      )}
                    >
                      <Skeleton className="h-8 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-muted-foreground px-4 py-8 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading &&
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    'border-border hover:bg-muted/40 border-t transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3',
                        col.sticky === 'right' &&
                          'before:to-background bg-background sticky right-0 z-10 before:pointer-events-none before:absolute before:top-0 before:right-full before:h-full before:w-7 before:bg-linear-to-r before:from-transparent',
                        col.sticky === 'left' &&
                          'after:to-background bg-background sticky left-0 z-10 after:pointer-events-none after:absolute after:top-0 after:left-full after:h-full after:w-7 after:bg-linear-to-l after:from-transparent',
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-border flex items-center justify-between border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rows per page</span>
          <Select
            options={PAGE_SIZE_OPTIONS}
            value={String(pageSize)}
            onChange={(v) => onPageSizeChange(Number(v ?? 10))}
            size="sm"
            className="w-20"
          />
          <span className="text-muted-foreground">of {total} records</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground mr-2">
            {total === 0
              ? '0'
              : `${start + 1}–${Math.min(start + pageSize, total)}`}{' '}
            of {total}
          </span>
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <IconChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost-muted"
            size="sm"
            className="size-8 p-0"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <IconChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

const DataTableRoot = ({ children }: { children: React.ReactNode }) => (
  <div className="border-border/40 shadow-shadow overflow-hidden rounded-xl border shadow-lg">
    {children}
  </div>
)

type IDataTableToolbarProps = React.HTMLAttributes<HTMLDivElement>

const DataTableToolbar: React.FC<IDataTableToolbarProps> = (props) => {
  const { children, className, ...rest } = props

  return (
    <div
      className={cn('border-border flex items-center border-b p-4', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

export {
  DataTable,
  DataTableRoot,
  DataTableToolbar,
  type IColumn,
  type IDataTableProps,
  type ISort,
  type ISortDir,
}
