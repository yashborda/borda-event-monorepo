'use client'

import { IconMoon, IconSun } from '@tabler/icons-react'

import { useSyncExternalStore } from 'react'

import { useTheme } from '../context/theme-provider'
import { Button } from './ui/button'

const subscribe = () => () => {}

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  return (
    <Button
      variant="ghost-secondary"
      shape="pill"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      {mounted && theme === 'dark' ? (
        <IconSun className="size-4" />
      ) : (
        <IconMoon className="size-4" />
      )}
    </Button>
  )
}
