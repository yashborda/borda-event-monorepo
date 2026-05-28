import { Button, Heading } from '@pkg/ui'

import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-muted-foreground text-6xl font-bold">404</p>
      <Heading as="h1">Page not found</Heading>
      <p className="text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  )
}

export default NotFound
