'use client'

import { Button, Switch } from '@pkg/ui'
import {
  IconChartBar,
  IconCookie,
  IconShield,
  IconTarget,
  IconTool,
  IconX,
} from '@tabler/icons-react'

import Link from 'next/link'

import { startTransition, useCallback, useEffect, useState } from 'react'

import {
  type CookiePreferences,
  acceptAllCookies,
  acceptNecessaryCookies,
  getCookiePreferences,
  hasConsentGiven,
  setConsentGiven,
  setCookiePreferences,
} from '@/utils/cookie.helper'

interface CookieConsentModalProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

const cookieCategories = [
  {
    key: 'necessary' as const,
    title: 'Necessary',
    description: 'Essential for the website to function. Cannot be disabled.',
    icon: IconShield,
    required: true,
  },
  {
    key: 'functional' as const,
    title: 'Functional',
    description: 'Enable personalized features and remember your preferences.',
    icon: IconTool,
    required: false,
  },
  {
    key: 'analytics' as const,
    title: 'Analytics',
    description: 'Help us understand how visitors interact with our website.',
    icon: IconChartBar,
    required: false,
  },
  {
    key: 'marketing' as const,
    title: 'Marketing',
    description: 'Allow us to show you relevant advertisements and promotions.',
    icon: IconTarget,
    required: false,
  },
]

export const CookieConsentModal = ({
  isOpen: controlledIsOpen,
  onOpenChange,
  trigger,
}: CookieConsentModalProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  })

  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen
  const isDismissable = !!trigger

  const setOpen = useCallback(
    (open: boolean) => {
      if (isControlled) {
        onOpenChange?.(open)
      } else {
        setInternalIsOpen(open)
      }
    },
    [isControlled, onOpenChange]
  )

  useEffect(() => {
    if (isControlled) {
      if (controlledIsOpen) {
        startTransition(() => {
          setPreferences(getCookiePreferences())
          setShowSettings(false)
        })
      }
      return
    }
    if (!hasConsentGiven()) {
      acceptAllCookies()
      window.dispatchEvent(new Event('cookieConsentUpdated'))
    }
    startTransition(() => {
      setPreferences(getCookiePreferences())
    })
  }, [controlledIsOpen, isControlled])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !isDismissable) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isDismissable, setOpen])

  const dispatchUpdate = () => {
    window.dispatchEvent(new Event('cookieConsentUpdated'))
  }

  const handleAcceptAll = () => {
    acceptAllCookies()
    setOpen(false)
    dispatchUpdate()
    window.location.reload()
  }

  const handleAcceptNecessary = () => {
    acceptNecessaryCookies()
    setOpen(false)
    dispatchUpdate()
    window.location.reload()
  }

  const handleSavePreferences = () => {
    setCookiePreferences(preferences)
    setConsentGiven(true)
    setOpen(false)
    dispatchUpdate()
    window.location.reload()
  }

  const handlePreferenceChange = (
    category: keyof CookiePreferences,
    enabled: boolean
  ) => {
    if (category === 'necessary') return
    setPreferences((prev) => ({ ...prev, [category]: enabled }))
  }

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={isDismissable ? () => setOpen(false) : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-dialog-title"
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-4"
      >
        <div className="bg-background max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div className="flex items-start gap-3">
              <IconCookie className="text-primary mt-0.5 size-12 shrink-0" />
              <div>
                <h2 id="cookie-dialog-title" className="text-heading-md">
                  Cookie Preferences
                </h2>
                <p className="text-muted-foreground text-body-sm mt-1">
                  We use cookies to enhance your experience. Read our{' '}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
            {isDismissable && (
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground -mt-1 -mr-2 shrink-0 rounded p-1 transition-colors"
                aria-label="Close"
              >
                <IconX className="size-4" />
              </button>
            )}
          </div>

          <div className="px-6 py-4">
            {!showSettings ? (
              <p className="text-muted-foreground text-body-md">
                We use cookies and similar technologies to help personalise
                content and provide a better experience. By clicking
                &ldquo;Accept All&rdquo;, you agree to this use. You can manage
                your preferences by clicking &ldquo;Customize&rdquo;.
              </p>
            ) : (
              <div className="divide-border/40 divide-y">
                {cookieCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <div
                      key={category.key}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div
                        className="flex cursor-pointer items-start gap-3"
                        onClick={() => {
                          if (category.required) return
                          handlePreferenceChange(
                            category.key,
                            !preferences[category.key]
                          )
                        }}
                      >
                        <Icon className="text-muted-foreground mt-0.5 size-5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-body-md font-medium">
                              {category.title}
                            </h3>
                            {category.required && (
                              <span className="text-label-sm text-muted-foreground">
                                (Required)
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-body-sm mt-0.5">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[category.key]}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(category.key, checked)
                        }
                        disabled={category.required}
                        className="mt-0.5 shrink-0"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
            {!showSettings ? (
              <>
                <Button
                  variant="outline-muted"
                  onClick={() => setShowSettings(true)}
                >
                  Customize
                </Button>
                <Button variant="outline-muted" onClick={handleAcceptNecessary}>
                  Accept Necessary Only
                </Button>
                <Button onClick={handleAcceptAll}>Accept All</Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline-muted"
                  onClick={() => setShowSettings(false)}
                >
                  Back
                </Button>
                <Button onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )

  if (trigger) {
    return (
      <>
        {trigger}
        {isOpen && modalContent}
      </>
    )
  }

  if (!isOpen) return null
  return modalContent
}
