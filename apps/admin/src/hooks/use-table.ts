import { type IApiError } from '@pkg/types'

import { useCallback, useEffect, useState } from 'react'

import { apiFetch } from '@/lib/api-client'
import { handleException } from '@/lib/api-helper'

import { type ISort } from '@/app/(protected)/_components/data-table'

import { useSearch } from './use-search'

type IPaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}

type IUseTableOptions = {
  endpoint: string
  defaultSort: ISort
  defaultPageSize?: number
  searchDelay?: number
  extraParams?: Record<string, string>
}

type IUseTableReturn<T> = {
  data: T[]
  total: number
  loading: boolean
  page: number
  pageSize: number
  sort: ISort
  search: string
  setSearch: (value: string) => void
  setSort: (sort: ISort) => void
  reload: () => void
  tableProps: {
    total: number
    page: number
    pageSize: number
    sort: ISort
    onSortChange: (key: string, dir: 'asc' | 'desc') => void
    onPageChange: (p: number) => void
    onPageSizeChange: (size: number) => void
  }
}

export const useTable = <T>({
  endpoint,
  defaultSort,
  defaultPageSize = 10,
  searchDelay = 600,
  extraParams,
}: IUseTableOptions): IUseTableReturn<T> => {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [sort, setSort] = useState<ISort>(defaultSort)
  const [version, setVersion] = useState(0)

  const {
    search,
    setSearch: setRawSearch,
    debouncedSearch,
  } = useSearch(searchDelay)

  const setSearch = useCallback(
    (value: string) => {
      setRawSearch(value)
      setPage(1)
      setLoading(true)
    },
    [setRawSearch]
  )

  const reload = useCallback(() => {
    setLoading(true)
    setVersion((v) => v + 1)
  }, [])

  // Stable serialisation — avoids new-object-reference re-renders
  const extraParamsSerialized = JSON.stringify(extraParams ?? {})

  useEffect(() => {
    // Wait until debounce has settled before fetching
    if (search !== debouncedSearch) return

    let cancelled = false

    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
      sortBy: sort.key,
      sortDir: sort.dir,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(extraParams ?? {}),
    })

    apiFetch<IPaginatedResponse<T>>(`${endpoint}?${params}`)
      .then((res) => {
        if (!cancelled) {
          setData(res.data)
          setTotal(res.total)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          handleException(e as IApiError)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    endpoint,
    page,
    pageSize,
    sort,
    search,
    debouncedSearch,
    version,
    extraParamsSerialized,
  ])

  return {
    data,
    total,
    loading,
    page,
    pageSize,
    sort,
    search,
    setSearch,
    setSort,
    reload,
    tableProps: {
      total,
      page,
      pageSize,
      sort,
      onSortChange: (key, dir) => {
        setSort({ key, dir })
        setPage(1)
        setLoading(true)
      },
      onPageChange: (p) => {
        setPage(p)
        setLoading(true)
      },
      onPageSizeChange: (size) => {
        setPageSize(size)
        setPage(1)
        setLoading(true)
      },
    },
  }
}
