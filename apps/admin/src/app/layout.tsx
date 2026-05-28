import { ThemeProvider, ThemeScript, Toaster } from '@pkg/ui'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { defaultMetadata } from '@/utils/seo.helper'

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

import { AuthProvider } from '@/context/auth-context'

import './globals.css'

const inter = Inter({
  variable: '--font-inter',
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
      className={`${inter.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout

export const generateMetadata = async (): Promise<Metadata> => ({
  ...defaultMetadata,
  robots: { index: false, follow: false },
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
    'application-name': 'Frostleaf',
    'msapplication-TileColor': '#FFFFFF',
    'msapplication-TileImage': mstile144.src,
    'msapplication-square70x70logo': mstile70.src,
    'msapplication-square150x150logo': mstile150.src,
    'msapplication-wide310x150logo': mstile310.src,
    'msapplication-square310x310logo': mstile310.src,
  },
})
