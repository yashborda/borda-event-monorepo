'use client'

import type { IPermission } from '@pkg/types'

import { useEffect, useMemo, useState } from 'react'

import { apiFetch } from '@/lib/api-client'

export interface UsePermissionSelectionReturn {
  grouped: Record<string, IPermission[]>
  filteredResources: string[]
  selectedIds: Set<string>
  selectedResource: string | null
  setSelectedResource: React.Dispatch<React.SetStateAction<string | null>>
  search: string
  setSearch: (v: string) => void
  togglePerm: (permId: string) => void
  toggleAllForResource: (resource: string) => void
  resetIds: (ids: Iterable<string>) => void
  setAllPermissions: React.Dispatch<React.SetStateAction<IPermission[]>>
  loading: boolean
}

export function usePermissionSelection(): UsePermissionSelectionReturn {
  const [allPermissions, setAllPermissions] = useState<IPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiFetch<IPermission[]>('/api/admin/permissions')
      .then((perms) => {
        setAllPermissions(perms)
        setSelectedResource((prev) => prev ?? perms[0]?.resource ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  const grouped = useMemo(
    () =>
      allPermissions.reduce<Record<string, IPermission[]>>((acc, p) => {
        acc[p.resource] = [...(acc[p.resource] ?? []), p]
        return acc
      }, {}),
    [allPermissions]
  )

  const resources = useMemo(() => Object.keys(grouped), [grouped])

  const filteredResources = useMemo(
    () =>
      resources.filter((r) => r.toLowerCase().includes(search.toLowerCase())),
    [resources, search]
  )

  const togglePerm = (permId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(permId)) next.delete(permId)
      else next.add(permId)
      return next
    })
  }

  const toggleAllForResource = (resource: string) => {
    const perms = grouped[resource] ?? []
    const allAssigned = perms.every((p) => selectedIds.has(p.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allAssigned) perms.forEach((p) => next.delete(p.id))
      else perms.forEach((p) => next.add(p.id))
      return next
    })
  }

  const resetIds = (ids: Iterable<string>) => {
    setSelectedIds(new Set(ids))
  }

  return {
    grouped,
    filteredResources,
    selectedIds,
    selectedResource,
    setSelectedResource,
    search,
    setSearch,
    togglePerm,
    toggleAllForResource,
    resetIds,
    setAllPermissions,
    loading,
  }
}
