import type { IPermissionName } from '@pkg/types'

import { useMemo } from 'react'

import { useAuth } from '@/context/auth-context'

type IWithOptionalPermission = { requiredPermission?: IPermissionName }

type IUsePermissionsReturn = {
  can(permission: IPermissionName): boolean
  canAny(permissions: IPermissionName[]): boolean
  canAll(permissions: IPermissionName[]): boolean
  canAccess(item: IWithOptionalPermission): boolean
}

export const usePermissions = (): IUsePermissionsReturn => {
  const { user } = useAuth()

  const permSet = useMemo<Set<IPermissionName>>(
    () => new Set(user?.effectivePermissions ?? []),
    [user]
  )

  return {
    can: (permission) => permSet.has(permission),
    canAny: (permissions) => permissions.some((p) => permSet.has(p)),
    canAll: (permissions) => permissions.every((p) => permSet.has(p)),
    canAccess: (item) =>
      item.requiredPermission === undefined
        ? true
        : permSet.has(item.requiredPermission),
  }
}
