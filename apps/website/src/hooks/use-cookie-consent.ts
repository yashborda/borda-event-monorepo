'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'

import {
  type CookiePreferences,
  getCookiePreferences,
  hasConsentGiven,
  isCookieTypeAllowed,
  necessaryPreferences,
} from '@/utils/cookie.helper'

export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    ...necessaryPreferences,
  })
  const [isLoading, setIsLoading] = useState(true)

  const syncState = useCallback(() => {
    const consent = hasConsentGiven()
    const prefs = getCookiePreferences()
    setHasConsent(consent)
    setPreferences(prefs)
  }, [])

  useEffect(() => {
    startTransition(() => {
      syncState()
      setIsLoading(false)
    })

    const interval = setInterval(syncState, 2000)

    const handleCookieUpdate = () => syncState()
    window.addEventListener('cookieConsentUpdated', handleCookieUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('cookieConsentUpdated', handleCookieUpdate)
    }
  }, [syncState])

  const canUseCookies = (type: keyof CookiePreferences) =>
    isCookieTypeAllowed(type)
  const canUseAnalytics = () => isCookieTypeAllowed('analytics')
  const canUseMarketing = () => isCookieTypeAllowed('marketing')
  const canUseFunctional = () => isCookieTypeAllowed('functional')

  return {
    hasConsent,
    preferences,
    isLoading,
    canUseCookies,
    canUseAnalytics,
    canUseMarketing,
    canUseFunctional,
  }
}
