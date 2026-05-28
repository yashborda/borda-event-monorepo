'use client'

import { IconArrowLeft } from '@tabler/icons-react'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button'
import { toast } from '../lib/toast'

const variants = ['default', 'success', 'error', 'warning', 'info'] as const
type IVariant = (typeof variants)[number]

const messages: Record<IVariant, string> = {
  default: 'This is a default toast',
  success: 'Changes saved successfully',
  error: 'Something went wrong',
  warning: 'Session about to expire',
  info: 'New update available',
}

const descriptions: Record<IVariant, string> = {
  default: 'A neutral notification for general information.',
  success: 'Your changes have been persisted to the server.',
  error: 'Please check your connection and try again.',
  warning: 'You have 5 minutes before being logged out.',
  info: 'Version 2.0 is ready to install.',
}

const actionLabels: Record<IVariant, string> = {
  default: 'Undo',
  success: 'View',
  error: 'Retry',
  warning: 'Stay logged in',
  info: 'Update',
}

const fireToast = (
  variant: IVariant,
  opts: { description?: boolean; closeButton?: boolean; action?: boolean } = {}
) => {
  const message = messages[variant]
  const extra = {
    ...(opts.description ? { description: descriptions[variant] } : {}),
    ...(opts.closeButton ? { closeButton: true } : {}),
    ...(opts.action
      ? {
          action: {
            label: actionLabels[variant],
            onClick: () => toast.success('Action triggered'),
          },
          cancel: { label: 'Dismiss', onClick: () => {} },
        }
      : {}),
  }
  if (variant === 'default') toast.default(message, extra)
  else toast[variant](message, extra)
}

const variantLabel: Record<IVariant, string> = {
  default: 'default',
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
}

const variantButtonMap: Record<IVariant, string> = {
  default: 'default',
  success: 'success',
  error: 'destructive',
  warning: 'warning',
  info: 'info',
}

type IColDef = { label: string; opts: Parameters<typeof fireToast>[1] }

const columns: IColDef[] = [
  { label: 'Basic', opts: {} },
  { label: 'With Description', opts: { description: true } },
  { label: 'With Close Button', opts: { closeButton: true } },
  { label: 'With Action', opts: { action: true } },
  {
    label: 'All Combined',
    opts: { description: true, closeButton: true, action: true },
  },
]

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-heading-sm text-foreground border-border border-b pb-2">
    {children}
  </h2>
)

const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-label-md text-muted-foreground">{children}</h3>
)

const MatrixTable = () => (
  <div className="border-border overflow-x-auto rounded-lg border">
    <table className="text-body-md w-full">
      <thead>
        <tr className="border-border bg-muted/50 border-b">
          <th className="text-muted-foreground text-label-sm px-4 py-2 text-left">
            Variant
          </th>
          {columns.map((col) => (
            <th
              key={col.label}
              className="text-muted-foreground text-label-sm px-4 py-2 text-left"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {variants.map((v) => (
          <tr key={v} className="border-border border-b last:border-0">
            <td className="text-muted-foreground text-body-sm px-4 py-3 font-mono">
              {variantLabel[v]}
            </td>
            {columns.map((col) => (
              <td key={col.label} className="px-4 py-3">
                <Button
                  variant={
                    variantButtonMap[v] as
                      | 'default'
                      | 'success'
                      | 'destructive'
                      | 'warning'
                      | 'info'
                  }
                  size="sm"
                  onClick={() => fireToast(v, col.opts)}
                >
                  Show
                </Button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const UiToasterPage = () => (
  <div className="bg-background min-h-screen p-8">
    <div className="mx-auto flex max-w-5xl flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<IconArrowLeft />}
          className="w-fit"
          asChild
        >
          <a href="/ui-kit">Back to UI Kit</a>
        </Button>
        <div>
          <h1 className="text-heading-2xl text-foreground">Toaster Testing</h1>
          <p className="text-body-md text-muted-foreground mt-1">
            All variant × option combinations
          </p>
        </div>
      </div>

      {/* Variant × Options matrix */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Variant × Options</SectionTitle>
        <MatrixTable />
      </section>

      {/* Promise */}
      <section className="flex flex-col gap-6">
        <SectionTitle>Promise</SectionTitle>
        <div className="flex flex-col gap-4">
          <SubTitle>Loading → Success</SubTitle>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 2000)),
                  {
                    loading: 'Saving changes…',
                    success: 'Changes saved successfully',
                    error: 'Failed to save',
                  }
                )
              }
            >
              Save (resolves)
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 2000)),
                  {
                    loading: 'Uploading file…',
                    success: 'File uploaded',
                    error: 'Upload failed',
                  }
                )
              }
            >
              Upload (resolves)
            </Button>
          </div>
          <SubTitle>Loading → Error</SubTitle>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline-destructive"
              onClick={() =>
                toast.promise(
                  new Promise((_, reject) => setTimeout(reject, 2000)),
                  {
                    loading: 'Deleting record…',
                    success: 'Record deleted',
                    error: 'Failed to delete',
                  }
                )
              }
            >
              Delete (rejects)
            </Button>
            <Button
              variant="outline-destructive"
              onClick={() =>
                toast.promise(
                  new Promise((_, reject) => setTimeout(reject, 2000)),
                  {
                    loading: 'Connecting to server…',
                    success: 'Connected',
                    error: 'Connection failed',
                  }
                )
              }
            >
              Connect (rejects)
            </Button>
          </div>
        </div>
      </section>

      {/* Stacking & Dismiss */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Stacking & Dismiss</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              toast.default('Default notification')
              toast.success('Operation completed')
              toast.error('Something failed')
              toast.warning('IconCheck your settings')
              toast.info('New update available')
            }}
          >
            Spawn all 5 variants
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              for (let i = 1; i <= 3; i++) {
                toast.default(`Notification ${i}`)
              }
            }}
          >
            Spawn 3 toasts
          </Button>
          <Button variant="destructive" onClick={() => toast.dismiss()}>
            Dismiss All
          </Button>
        </div>
      </section>

      {/* Duration */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Duration</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.default('Short toast', { duration: 1500 })}
          >
            1.5 s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.default('Default duration toast')}
          >
            Default (4 s)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.default('Long toast', { duration: 10000 })}
          >
            10 s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.default('Persistent toast', { duration: Infinity })
            }
          >
            Persistent (∞)
          </Button>
        </div>
      </section>
    </div>
  </div>
)
