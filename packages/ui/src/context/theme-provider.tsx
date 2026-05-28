'use client'

import { createContext, useContext, useSyncExternalStore } from 'react'

type ITheme = 'light' | 'dark'

type IThemeContextValue = {
  theme: ITheme
  setTheme: (theme: ITheme) => void
}

const ThemeContext = createContext<IThemeContextValue | null>(null)

const THEME_EVENT = 'theme-change'

const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(THEME_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

const getSnapshot = (): ITheme =>
  (localStorage.getItem('theme') as ITheme | null) ?? 'light'

const getServerSnapshot = (): ITheme => 'light'

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setTheme = (next: ITheme) => {
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    window.dispatchEvent(new CustomEvent(THEME_EVENT))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
