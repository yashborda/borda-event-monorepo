'use client'

import { IconX } from '@tabler/icons-react'
import { Dialog as RadixDialog } from 'radix-ui'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Button, type IButtonProps } from './button'

type IDialogAction = {
  label: string
  onClick?: () => void
  variant?: IButtonProps['variant']
  type?: 'button' | 'submit'
  form?: string
  disabled?: boolean
  className?: string
}

type IDialogProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title: string
  description?: string
  actions?: IDialogAction[]
  children?: React.ReactNode
  className?: string
}

const Dialog = ({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  actions,
  children,
  className,
}: IDialogProps) => (
  <RadixDialog.Root
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
  >
    {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
      <RadixDialog.Content
        aria-describedby={undefined}
        className={cn(
          'bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className
        )}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1">
            <RadixDialog.Title className="text-heading-md tracking-tight">
              {title}
            </RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="text-muted-foreground text-body-md">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close
            className="text-muted-foreground hover:text-foreground -mt-1 -mr-2 rounded p-1 transition-colors"
            aria-label="Close"
          >
            <IconX className="size-4" />
          </RadixDialog.Close>
        </div>
        <div className="px-6 py-2">{children}</div>
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2 px-6 py-4">
            {actions.map((action, i) => (
              <Button
                key={i}
                type={action.type ?? 'button'}
                variant={action.variant ?? 'default'}
                disabled={action.disabled}
                onClick={action.onClick}
                form={action.form}
                className={action.className}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
)

export { Dialog, type IDialogAction, type IDialogProps }
