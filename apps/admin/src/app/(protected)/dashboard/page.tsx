'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@pkg/ui'

import { useAuth } from '@/context/auth-context'

import { PageHeader } from '../_components/page-header'

const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back${user?.fullName ? `, ${user.fullName}` : ''}`}
        description="Admin Overview"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl">—</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active Roles</CardDescription>
            <CardTitle className="text-2xl">—</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Permissions</CardDescription>
            <CardTitle className="text-2xl">14</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
