import { ThemeToggle } from '@pkg/ui'

import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthGuard } from './_components/auth-guard'
import { SidebarNav } from './_components/sidebar-nav'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="bg-card border-border flex w-60 flex-col border-r">
        <div className="border-border flex h-16 items-center border-b px-6">
          <Link href="/" className="text-foreground text-lg font-bold">
            Frostleaf
          </Link>
        </div>
        <SidebarNav />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-card border-border flex h-16 items-center justify-end gap-3 border-b px-6">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <AuthGuard>{children}</AuthGuard>
        </main>
      </div>
    </div>
  )
}

export default ProtectedLayout
