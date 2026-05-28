import Link from 'next/link'

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <header className="border-border bg-card border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-foreground text-lg font-bold">
              Frostleaf
            </Link>
            <span className="text-muted-foreground text-sm">Admin Panel</span>
          </div>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Sign in
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-border border-t py-4">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Frostleaf.com &mdash;{' '}
            <Link href="/status" className="hover:text-foreground underline">
              Status
            </Link>
          </p>
        </div>
      </footer>
    </>
  )
}

export default PublicLayout
