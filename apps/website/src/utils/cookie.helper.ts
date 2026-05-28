export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export const COOKIE_CONSENT_KEY = 'cookie-consent'
export const COOKIE_PREFERENCES_KEY = 'cookie-preferences'

export const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
}

export const necessaryPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
}

export const setCookie = (name: string, value: string, days = 365) => {
  if (typeof window === 'undefined') return
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`
}

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const c = cookie.trim()
    if (c.startsWith(nameEQ)) {
      return c.substring(nameEQ.length)
    }
  }
  return null
}

export const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`
}

export const hasConsentGiven = (): boolean => {
  return getCookie(COOKIE_CONSENT_KEY) === 'true'
}

export const setConsentGiven = (consent: boolean) => {
  setCookie(COOKIE_CONSENT_KEY, consent.toString(), 365)
}

export const getCookiePreferences = (): CookiePreferences => {
  const raw = getCookie(COOKIE_PREFERENCES_KEY)
  if (!raw) return { ...necessaryPreferences }
  try {
    const parsed = JSON.parse(raw)
    return { ...necessaryPreferences, ...parsed }
  } catch {
    return { ...necessaryPreferences }
  }
}

export const setCookiePreferences = (preferences: CookiePreferences) => {
  setCookie(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences), 365)
}

export const acceptAllCookies = () => {
  setConsentGiven(true)
  setCookiePreferences({
    necessary: true,
    analytics: true,
    marketing: true,
    functional: true,
  })
}

export const acceptNecessaryCookies = () => {
  setConsentGiven(true)
  setCookiePreferences(necessaryPreferences)
}

export const clearCookieData = () => {
  deleteCookie(COOKIE_CONSENT_KEY)
  deleteCookie(COOKIE_PREFERENCES_KEY)
}

export const isCookieTypeAllowed = (type: keyof CookiePreferences): boolean => {
  if (!hasConsentGiven()) return false
  const preferences = getCookiePreferences()
  return preferences[type] === true
}
