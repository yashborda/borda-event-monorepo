'use client'

import { useState } from 'react'

import { CookieConsentModal } from './cookie-consent-modal'

export const CookieSettingsButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <CookieConsentModal
      isOpen={open}
      onOpenChange={setOpen}
      trigger={
        <button
          className="text-muted-foreground hover:text-foreground text-sm"
          onClick={() => setOpen(true)}
        >
          Cookie Settings
        </button>
      }
    />
  )
}
