'use client'

import { Button } from '@pkg/ui'

import { useState } from 'react'

import { CookieConsentModal } from './cookie-consent-modal'

export const ManageCookiePreferencesButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <CookieConsentModal
      isOpen={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline" onClick={() => setOpen(true)}>
          Manage Cookie Preferences
        </Button>
      }
    />
  )
}
