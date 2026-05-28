'use client'

import { Button, Heading } from '@pkg/ui'

const GlobalError = ({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-muted-foreground text-6xl font-bold">500</p>
      <Heading as="h1">Something went wrong</Heading>
      <p className="text-muted-foreground max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

export default GlobalError
