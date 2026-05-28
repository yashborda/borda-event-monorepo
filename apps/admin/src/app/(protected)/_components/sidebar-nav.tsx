'use client'

import type { IPermissionName } from '@pkg/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Separator,
} from '@pkg/ui'
import {
  IconChevronDown,
  IconLayoutDashboard,
  IconLogout,
  IconShieldCheck,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useState } from 'react'

import { usePermissions } from '@/hooks/use-permissions'

import { useAuth } from '@/context/auth-context'

type INavLeaf = {
  type: 'link'
  href: string
  label: string
  icon: React.ReactNode
  requiredPermission?: IPermissionName
}

type INavGroup = {
  label: string
  icon: React.ReactNode
  items: INavLeaf[]
}

type INavSection =
  | { type: 'direct'; item: INavLeaf }
  | { type: 'section'; sectionLabel: string; groups: INavGroup[] }

const navSections: INavSection[] = [
  {
    type: 'direct',
    item: {
      type: 'link',
      href: '/dashboard',
      label: 'Dashboard',
      icon: <IconLayoutDashboard className="size-4" />,
    },
  },
  {
    type: 'section',
    sectionLabel: 'USER MANAGEMENT',
    groups: [
      {
        label: 'Users & Roles',
        icon: <IconUsers className="size-4" />,
        items: [
          {
            type: 'link',
            href: '/users',
            label: 'Users',
            icon: <IconUser className="size-4" />,
            requiredPermission: 'users:read',
          },
          {
            type: 'link',
            href: '/roles',
            label: 'Roles',
            icon: <IconShieldCheck className="size-4" />,
            requiredPermission: 'roles:read',
          },
        ],
      },
    ],
  },
]

const getInitials = (name: string | null | undefined, email: string) => {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export const SidebarNav = () => {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Users & Roles': true,
  })
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const { canAccess } = usePermissions()

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    setLogoutDialogOpen(false)
    await logout()
    router.push('/login')
  }

  const initials = user ? getInitials(user.fullName, user.email) : ''

  return (
    <div className="flex flex-1 flex-col justify-between overflow-hidden py-3">
      {/* Nav */}
      <nav className="flex flex-col gap-0.5 overflow-y-auto px-3">
        {navSections.map((section, si) => {
          if (section.type === 'direct') {
            const item = section.item
            if (!canAccess(item)) return null
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-body-md flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                  isActive(item.href)
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          }

          const visibleGroups = section.groups
            .map((group) => ({
              ...group,
              items: group.items.filter(canAccess),
            }))
            .filter((g) => g.items.length > 0)

          if (visibleGroups.length === 0) return null

          return (
            <div key={si} className="mt-4 flex flex-col gap-0.5">
              <p className="text-label-sm text-muted-foreground mb-1 px-3">
                {section.sectionLabel}
              </p>
              {visibleGroups.map((group) => {
                const expanded = openGroups[group.label] ?? false
                const groupActive = group.items.some((i) => isActive(i.href))

                return (
                  <div key={group.label}>
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={`text-body-md flex w-full items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                        groupActive && !expanded
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      {group.icon}
                      <span className="flex-1 text-left">{group.label}</span>
                      <IconChevronDown
                        className={`size-3.5 transition-transform ${expanded ? '' : '-rotate-90'}`}
                      />
                    </button>

                    {expanded && (
                      <div className="mt-0.5 ml-3 flex flex-col gap-0.5 border-l pl-3">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`text-body-md flex items-center gap-3 rounded-md px-3 py-1.5 transition-colors ${
                              isActive(item.href)
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            }`}
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Profile */}
      <div className="px-3 pt-3">
        <Separator className="mb-3" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-md px-2 py-2 transition-colors">
              <Avatar className="shrink-0">
                <AvatarImage
                  src={user?.avatarUrl ?? undefined}
                  alt={user?.fullName ?? ''}
                />
                <AvatarFallback className="text-body-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-body-sm text-foreground truncate font-medium">
                  {user?.fullName ?? user?.email}
                </span>
                <span className="text-body-sm text-muted-foreground truncate">
                  {user?.roles?.[0] ?? 'admin'}
                </span>
              </div>
              <IconChevronDown className="text-muted-foreground size-3.5 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-body-md text-foreground font-medium">
                  {user?.fullName ?? user?.email}
                </span>
                <span className="text-body-sm text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <IconUser />
                  Profile
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <IconLogout />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout confirmation */}
      <Dialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        actions={[
          {
            label: 'Cancel',
            variant: 'outline-muted',
            onClick: () => setLogoutDialogOpen(false),
            className: 'ml-auto',
          },
          {
            label: 'Sign Out',
            variant: 'destructive',
            onClick: handleLogout,
          },
        ]}
      >
        <div />
      </Dialog>
    </div>
  )
}
