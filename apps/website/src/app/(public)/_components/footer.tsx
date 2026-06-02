import Link from 'next/link'

import { CookieSettingsButton } from '@/components/custom/cookie-settings-button'

export const Footer = () => {
  return (
    <footer className="border-border/40 bg-background border-t">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </div>
        </div>
        <div className="border-border/40 mt-10 border-t pt-8">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Borda Event. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
