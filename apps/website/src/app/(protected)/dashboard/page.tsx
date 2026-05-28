'use client'

import { Card, CardDescription, CardHeader, CardTitle, Heading } from '@pkg/ui'

import { useAuth } from '@/context/auth-context'

const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading as="h1">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}!
        </Heading>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s an overview of your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>You have 0 active projects.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>0 API calls this month.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Free tier — upgrade anytime.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
