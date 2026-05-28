import { Button, Heading } from '@pkg/ui'

import Link from 'next/link'

const ForbiddenPage = () => {
  return (
    <div className="flex max-w-sm flex-col items-center gap-6 text-center">
      <p className="text-muted-foreground text-6xl font-bold">403</p>
      <Heading as="h1">Access denied</Heading>
      <p className="text-muted-foreground">
        You don&apos;t have permission to view this page.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}

export default ForbiddenPage
