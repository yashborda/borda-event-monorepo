'use client'

import { Button } from '@pkg/ui'

const GlobalError = ({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-muted-foreground text-6xl font-bold">500</p>
      <h1 className="text-heading-xl text-foreground">Something went wrong</h1>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}

export default GlobalError
