import { Button, Logo, ThemeToggle } from '@pkg/ui'

import { cookies } from 'next/headers'
import Link from 'next/link'

export const Navbar = async () => {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get('session_exists')?.value === 'true'

  return (
    <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/">
          <Logo className="h-10 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            About
          </Link>
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
