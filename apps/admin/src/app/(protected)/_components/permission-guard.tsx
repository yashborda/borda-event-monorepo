'use client'

import type { IPermissionName } from '@pkg/types'

import { useRouter } from 'next/navigation'

import { useEffect } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { useAuth } from '@/context/auth-context'

type IPermissionGuardProps = {
  permission?: IPermissionName
  canAny?: IPermissionName[]
  canAll?: IPermissionName[]
  redirectTo: string
  children: React.ReactNode
}

const PermissionGuard = ({
  permission,
  canAny,
  canAll,
  redirectTo,
  children,
}: IPermissionGuardProps) => {
  const { status } = useAuth()
  const { can, canAny: checkAny, canAll: checkAll } = usePermissions()
  const router = useRouter()

  const hasPermission =
    permission !== undefined
      ? can(permission)
      : canAny !== undefined
        ? checkAny(canAny)
        : canAll !== undefined
          ? checkAll(canAll)
          : true

  const isLoading = status === 'loading'
  const shouldRedirect = !isLoading && !hasPermission

  useEffect(() => {
    if (shouldRedirect) router.replace(redirectTo)
  }, [shouldRedirect, redirectTo, router])

  if (isLoading || shouldRedirect) return null

  return <>{children}</>
}

export { PermissionGuard }
