import { ThemeProvider, ThemeScript, Toaster } from '@pkg/ui'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Script from 'next/script'

import { getAbsoluteUrl } from '@/utils/absolute-url.helper'
import { defaultMetadata } from '@/utils/seo.helper'

import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { CookieConsentModal } from '@/components/custom/cookie-consent-modal'

import apple60 from '@/assets/favicons/apple-touch-icon-60.png'
import apple72 from '@/assets/favicons/apple-touch-icon-72.png'
import apple76 from '@/assets/favicons/apple-touch-icon-76.png'
import apple114 from '@/assets/favicons/apple-touch-icon-114.png'
import apple120 from '@/assets/favicons/apple-touch-icon-120.png'
import apple144 from '@/assets/favicons/apple-touch-icon-144.png'
import apple152 from '@/assets/favicons/apple-touch-icon-152.png'
// Root-level apple icons
import appleTouch from '@/assets/favicons/apple-touch-icon.png'
import favicon16 from '@/assets/favicons/favicon-16.png'
import favicon32 from '@/assets/favicons/favicon-32.png'
import favicon96 from '@/assets/favicons/favicon-96.png'
import favicon128 from '@/assets/favicons/favicon-128.png'
import favicon196 from '@/assets/favicons/favicon-196.png'
// Windows tiles
import mstile70 from '@/assets/favicons/mstile-70.png'
import mstile144 from '@/assets/favicons/mstile-144.png'
import mstile150 from '@/assets/favicons/mstile-150.png'
import mstile310 from '@/assets/favicons/mstile-310.png'
import brandBanner from '@/assets/images/banner.png'

import { AuthProvider } from '@/context/auth-context'

import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ThemeProvider>
          <NuqsAdapter>
            <AuthProvider>{children}</AuthProvider>
          </NuqsAdapter>
          <Toaster />
          <CookieConsentModal />
          <GoogleAnalytics />
        </ThemeProvider>

        <Script
          id="structured-data-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="structured-data-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </body>
    </html>
  )
}

export default RootLayout

const websiteSchema = {
  '@context': 'http://schema.org',
  '@type': 'WebSite',
  name: 'Borda Event',
  url: 'https://bordaevent.com',
  // sameAs: [
  //   "https://linkedin.com/company/bordaevent",
  //   "https://x.com/bordaevent",
  // ],
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Borda Event',
  url: 'https://bordaevent.com',
  // Prefer an absolute logo URL. Update if your canonical logo URL differs.
  logo: getAbsoluteUrl(brandBanner.src),
  // sameAs: [
  //   "https://twitter.com/bordaevent",
  //   "https://x.com/bordaevent",
  //   "https://linkedin.com/company/bordaevent",
  // ],
  foundingDate: '2026',
  description:
    'Luxury wedding and event decoration & management in Surat, Gujarat. Planning for an event — elegant, royal, and unforgettable celebrations.',
}

export const generateMetadata = async (): Promise<Metadata> => ({
  ...defaultMetadata,
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: favicon16.src, sizes: '16x16', type: 'image/png' },
      { url: favicon32.src, sizes: '32x32', type: 'image/png' },
      { url: favicon96.src, sizes: '96x96', type: 'image/png' },
      { url: favicon128.src, sizes: '128x128', type: 'image/png' },
      { url: favicon196.src, sizes: '196x196', type: 'image/png' },
    ],
    apple: [
      { url: appleTouch.src, sizes: '192x192', type: 'image/png' },
      { url: apple60.src, sizes: '60x60', type: 'image/png' },
      { url: apple72.src, sizes: '72x72', type: 'image/png' },
      { url: apple76.src, sizes: '76x76', type: 'image/png' },
      { url: apple114.src, sizes: '114x114', type: 'image/png' },
      { url: apple120.src, sizes: '120x120', type: 'image/png' },
      { url: apple144.src, sizes: '144x144', type: 'image/png' },
      { url: apple152.src, sizes: '152x152', type: 'image/png' },
    ],
  },
  other: {
    'application-name': 'Borda Event',
    'msapplication-TileColor': '#FFFFFF',
    'msapplication-TileImage': mstile144.src,
    'msapplication-square70x70logo': mstile70.src,
    'msapplication-square150x150logo': mstile150.src,
    'msapplication-wide310x150logo': mstile310.src,
    'msapplication-square310x310logo': mstile310.src,
  },
})
