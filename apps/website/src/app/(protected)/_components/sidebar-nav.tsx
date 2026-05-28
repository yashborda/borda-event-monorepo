'use client'

import { Button } from '@pkg/ui'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useAuth } from '@/context/auth-context'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
]

export const SidebarNav = () => {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex flex-1 flex-col justify-between py-4">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              pathname === item.href
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-border flex flex-col gap-3 border-t px-3 pt-4">
        {user && (
          <div className="flex items-center gap-2 px-2">
            <div className="bg-muted h-8 w-8 overflow-hidden rounded-full">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.fullName ?? ''}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex flex-col">
              <span className="text-foreground max-w-[120px] truncate text-xs font-medium">
                {user.fullName ?? user.email}
              </span>
              <span className="text-muted-foreground max-w-[120px] truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
