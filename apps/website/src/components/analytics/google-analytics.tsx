'use client'

import Script from 'next/script'

import { startTransition, useEffect, useState } from 'react'

import { isCookieTypeAllowed } from '@/utils/cookie.helper'

import { useCookieConsent } from '@/hooks/use-cookie-consent'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: GtagFn
  }
}

export const GoogleAnalytics = () => {
  const { hasConsent, isLoading, canUseAnalytics } = useCookieConsent()
  const [shouldLoadGA, setShouldLoadGA] = useState(false)

  useEffect(() => {
    if (isLoading) return
    startTransition(() => {
      if (hasConsent && canUseAnalytics() && GA_ID) {
        setShouldLoadGA(true)
      } else if (hasConsent && !canUseAnalytics()) {
        setShouldLoadGA(false)
      }
    })
  }, [hasConsent, isLoading, canUseAnalytics])

  if (!GA_ID || !shouldLoadGA) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
        }}
      />
    </>
  )
}

export const trackEvent = async (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  const { isCookieTypeAllowed: check } = await import('@/utils/cookie.helper')
  if (!check('analytics')) return
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  })
}

export const trackPageView = async (url: string, title?: string) => {
  if (!isCookieTypeAllowed('analytics')) return
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_location: url,
    page_title: title,
  })
}
