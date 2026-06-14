import { Logo } from '@pkg/ui'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconMapPin,
  IconPhone,
} from '@tabler/icons-react'

import Link from 'next/link'

import { CookieSettingsButton } from '@/components/custom/cookie-settings-button'

import {
  FACEBOOK,
  INSTAGRAM,
  LOCATION,
  PHONE,
  SOCIAL_HANDLE,
  TAGLINE,
  TEL,
  waLink,
} from '@/config/site'

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export const Footer = () => (
  <footer className="bg-brand-brown text-brand-cream">
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="grid gap-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <Logo variant="light" className="h-12 w-auto" />
          <p className="font-display mt-4 text-lg">{TAGLINE}</p>
          <p className="mt-2 max-w-xs text-sm text-white/70">
            Luxury decoration & event management in {LOCATION}.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:bg-brand-copper rounded-md bg-white/10 p-2 transition-colors"
            >
              <IconBrandInstagram className="size-5" />
            </a>
            <a
              href={FACEBOOK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:bg-brand-copper rounded-md bg-white/10 p-2 transition-colors"
            >
              <IconBrandFacebook className="size-5" />
            </a>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:bg-brand-copper rounded-md bg-white/10 p-2 transition-colors"
            >
              <IconBrandWhatsapp className="size-5" />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>
              <a
                href={TEL}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <IconPhone className="size-4 shrink-0" />
                {PHONE}
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <IconBrandInstagram className="size-4 shrink-0" />
                {SOCIAL_HANDLE}
              </a>
            </li>
            <li>
              <a
                href={FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <IconBrandFacebook className="size-4 shrink-0" />
                {SOCIAL_HANDLE}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <IconMapPin className="size-4 shrink-0" />
              {LOCATION}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 text-sm text-white/60 sm:flex-row">
        <p>&copy; 2025 Borda Event, Surat. All Rights Reserved.</p>
        <CookieSettingsButton />
      </div>
    </div>
  </footer>
)
