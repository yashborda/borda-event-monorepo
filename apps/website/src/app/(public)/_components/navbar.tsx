'use client'

import { Button, Logo, cn } from '@pkg/ui'
import { IconBrandWhatsapp, IconMenu2, IconX } from '@tabler/icons-react'

import Link from 'next/link'

import * as React from 'react'

import { waLink } from '@/config/site'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export const Navbar = () => {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 border-border/40 border-b shadow-sm backdrop-blur'
          : 'bg-background border-b border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" aria-label="Borda Event home">
          <Logo className="h-11 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-brand-ink/80 hover:text-brand-copper text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-brand-copper hover:bg-brand-copper/85 hidden text-white sm:inline-flex"
          >
            <a href={waLink()} target="_blank" rel="noopener noreferrer">
              <IconBrandWhatsapp className="size-4" />
              Book Now
            </a>
          </Button>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="text-brand-ink p-1 md:hidden"
          >
            <IconMenu2 className="size-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-60 md:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {/* backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'bg-brand-ink/50 absolute inset-0 transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0'
          )}
        />
        {/* panel */}
        <aside
          className={cn(
            'bg-background absolute top-0 right-0 flex h-full w-72 max-w-[80%] flex-col p-6 shadow-xl transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between">
            <Logo className="h-10 w-auto" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="text-brand-ink p-1"
            >
              <IconX className="size-6" />
            </button>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-brand-ink hover:bg-brand-copper/10 hover:text-brand-copper rounded-md px-3 py-3 text-base font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Button
            asChild
            className="bg-brand-copper hover:bg-brand-copper/85 mt-6 text-white"
          >
            <a href={waLink()} target="_blank" rel="noopener noreferrer">
              <IconBrandWhatsapp className="size-4" />
              Book Now
            </a>
          </Button>
        </aside>
      </div>
    </header>
  )
}
