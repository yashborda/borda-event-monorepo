'use client'

import type { IPermissionName } from '@pkg/types'
import { Logo } from '@pkg/ui'
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
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useTheme,
} from '@pkg/ui'
import {
  IconAddressBook,
  IconBook,
  IconBooks,
  IconCalendarEvent,
  IconChevronDown,
  IconChevronsLeft,
  IconChevronsRight,
  IconFileText,
  IconFolderOpen,
  IconLayoutDashboard,
  IconLogout,
  IconMessageCircle,
  IconMoon,
  IconReceipt,
  IconShare3,
  IconShieldCheck,
  IconSparkles,
  IconTag,
  IconUser,
  IconUserEdit,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

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
      icon: <IconLayoutDashboard className="size-4 shrink-0" />,
    },
  },
  {
    type: 'section',
    sectionLabel: 'USER MANAGEMENT',
    groups: [
      {
        label: 'Users & Roles',
        icon: <IconUsers className="size-4 shrink-0" />,
        items: [
          {
            type: 'link',
            href: '/users',
            label: 'Users',
            icon: <IconUser className="size-4 shrink-0" />,
            requiredPermission: 'users:read',
          },
          {
            type: 'link',
            href: '/roles',
            label: 'Roles',
            icon: <IconShieldCheck className="size-4 shrink-0" />,
            requiredPermission: 'roles:read',
          },
          {
            type: 'link',
            href: '/website-users',
            label: 'Website Users',
            icon: <IconWorld className="size-4 shrink-0" />,
            requiredPermission: 'website-users:read',
          },
        ],
      },
    ],
  },
  {
    type: 'section',
    sectionLabel: 'CONTENT',
    groups: [
      {
        label: 'Blogs',
        icon: <IconBook className="size-4 shrink-0" />,
        items: [
          {
            type: 'link',
            href: '/blogs',
            label: 'Blogs',
            icon: <IconFileText className="size-4 shrink-0" />,
            requiredPermission: 'blogs:read',
          },
          {
            type: 'link',
            href: '/blog-categories',
            label: 'Blog Categories',
            icon: <IconFolderOpen className="size-4 shrink-0" />,
            requiredPermission: 'blog-categories:read',
          },
          {
            type: 'link',
            href: '/blog-authors',
            label: 'Blog Authors',
            icon: <IconUserEdit className="size-4 shrink-0" />,
            requiredPermission: 'blog-authors:read',
          },
          {
            type: 'link',
            href: '/blog-tags',
            label: 'Blog Tags',
            icon: <IconTag className="size-4 shrink-0" />,
            requiredPermission: 'blog-tags:read',
          },
        ],
      },
    ],
  },
  {
    type: 'section',
    sectionLabel: 'EVENT MANAGEMENT',
    groups: [
      {
        label: 'Event Management',
        icon: <IconCalendarEvent className="size-4 shrink-0" />,
        items: [
          {
            type: 'link',
            href: '/services',
            label: 'Services',
            icon: <IconSparkles className="size-4 shrink-0" />,
            requiredPermission: 'services:read',
          },
          {
            type: 'link',
            href: '/customers',
            label: 'Customers',
            icon: <IconAddressBook className="size-4 shrink-0" />,
            requiredPermission: 'customers:read',
          },
          {
            type: 'link',
            href: '/bills',
            label: 'Bills',
            icon: <IconReceipt className="size-4 shrink-0" />,
            requiredPermission: 'bills:read',
          },
          {
            type: 'link',
            href: '/catalogues',
            label: 'Catalogues',
            icon: <IconBooks className="size-4 shrink-0" />,
            requiredPermission: 'catalogues:read',
          },
          {
            type: 'link',
            href: '/inquiries',
            label: 'Inquiries',
            icon: <IconMessageCircle className="size-4 shrink-0" />,
            requiredPermission: 'inquiries:read',
          },
          {
            type: 'link',
            href: '/social-posts',
            label: 'Social Posts',
            icon: <IconShare3 className="size-4 shrink-0" />,
            requiredPermission: 'social-posts:read',
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

type INavLinkProps = {
  item: INavLeaf
  active: boolean
  collapsed: boolean
}

const NavLink = ({ item, active, collapsed }: INavLinkProps) => {
  const link = (
    <Link
      href={item.href}
      className={`text-body-md flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
        active
          ? 'bg-muted text-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      } ${collapsed ? 'justify-center px-2' : ''}`}
    >
      {item.icon}
      {!collapsed && item.label}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}

export const Sidebar = () => {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const section of navSections) {
      if (section.type === 'section') {
        for (const group of section.groups) {
          initial[group.label] = group.items.some((item) =>
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          )
        }
      }
    }
    return initial
  })
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setCollapsed((c) => !c)
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [theme, setTheme])

  const { canAccess } = usePermissions()

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))

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
  const isDark = theme === 'dark'

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={`border-border flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-14' : 'w-60'}`}
      >
        {/* Brand */}
        <div className="border-border flex h-14 items-center border-b px-3">
          {collapsed ? (
            <Link href="/dashboard" className="mx-auto">
              <Logo iconOnly className="h-7 w-auto" />
            </Link>
          ) : (
            <Link href="/dashboard" className="flex flex-1 items-center gap-2">
              <Logo className="h-7 w-auto" />
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
          {navSections.map((section, si) => {
            if (section.type === 'direct') {
              const item = section.item
              if (!canAccess(item)) return null
              return (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
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
                {!collapsed && (
                  <p className="text-label-sm text-muted-foreground mb-1 px-3">
                    {section.sectionLabel}
                  </p>
                )}
                {visibleGroups.map((group) => {
                  const expanded = openGroups[group.label] ?? false
                  const groupActive = group.items.some((i) => isActive(i.href))

                  if (collapsed) {
                    return (
                      <div key={group.label} className="flex flex-col gap-0.5">
                        {group.items.map((item) => (
                          <NavLink
                            key={item.href}
                            item={item}
                            active={isActive(item.href)}
                            collapsed={collapsed}
                          />
                        ))}
                      </div>
                    )
                  }

                  return (
                    <div key={group.label}>
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className={`text-body-md flex w-full items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                          groupActive && !expanded
                            ? 'bg-muted text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {group.icon}
                        <span className="flex-1 text-left">{group.label}</span>
                        <IconChevronDown
                          className={`size-3.5 transition-transform ${expanded ? '' : '-rotate-90'}`}
                        />
                      </button>

                      {expanded && (
                        <div className="mt-0.5 ml-3 flex flex-col gap-0.5 pl-3">
                          {group.items.map((item) => (
                            <NavLink
                              key={item.href}
                              item={item}
                              active={isActive(item.href)}
                              collapsed={false}
                            />
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
        <div className="px-2 pb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className={`text-body-md text-muted-foreground hover:text-foreground hover:bg-muted mb-1 flex w-full items-center rounded-md px-3 py-2 transition-colors ${collapsed ? 'justify-center' : 'gap-3'}`}
              >
                {collapsed ? (
                  <IconChevronsRight className="size-4 shrink-0" />
                ) : (
                  <>
                    <IconChevronsLeft className="size-4 shrink-0" />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? 'Expand' : 'Collapse'} <kbd>⌘B</kbd>
            </TooltipContent>
          </Tooltip>
          <Separator className="mb-3" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`hover:bg-muted flex w-full items-center rounded-md px-2 py-2 transition-colors ${collapsed ? 'justify-center' : 'gap-3'}`}
              >
                <Avatar className="shrink-0">
                  <AvatarImage
                    src={user?.avatarUrl ?? undefined}
                    alt={user?.fullName ?? ''}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="flex min-w-0 flex-1 flex-col text-left">
                      <span className="text-body-sm text-foreground truncate font-medium">
                        {user?.fullName ?? user?.email}
                      </span>
                      <span className="text-body-sm text-muted-foreground truncate">
                        {user?.roles?.[0] ?? 'admin'}
                      </span>
                    </div>
                    <IconChevronDown className="text-muted-foreground size-3.5 shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align={collapsed ? 'center' : 'start'}
              className="w-56"
            >
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
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                >
                  <IconMoon />
                  <span className="flex-1">Dark Mode</span>
                  <kbd className="text-muted-foreground text-label-sm mr-1">
                    ⌘⇧L
                  </kbd>
                  <Switch
                    size="sm"
                    checked={isDark}
                    onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
                    onClick={(e) => e.stopPropagation()}
                  />
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
      </aside>

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
    </TooltipProvider>
  )
}
