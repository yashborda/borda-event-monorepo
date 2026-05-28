import { Logo, ThemeToggle } from '@pkg/ui'

import Link from 'next/link'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col">
          <Link href="/">
            <Logo className="h-8 w-auto" />
          </Link>
          <span className="text-muted-foreground -m-1 pl-10.5 text-xs">
            Admin Panel
          </span>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}

export default AuthLayout
