import { Button } from '@pkg/ui'

import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-muted-foreground text-6xl font-bold">404</p>
      <h1 className="text-heading-xl text-foreground">Page not found</h1>
      <p className="text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back To Dashboard</Link>
      </Button>
    </div>
  )
}

export default NotFound
