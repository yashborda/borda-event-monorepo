'use client'

import { type VariantProps, cva } from 'class-variance-authority'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { useTheme } from '../../context/theme-provider'

const toastVariants = cva('group toast !shadow-lg !shadow-shadow !border', {
  variants: {
    variant: {
      default: '!bg-background !text-foreground !border-border',
      success: '!bg-success !text-success-foreground !border-success',
      error: '!bg-destructive !text-destructive-foreground !border-destructive',
      warning: '!bg-warning !text-warning-foreground !border-warning',
      info: '!bg-info !text-info-foreground !border-info',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type IToastVariant = NonNullable<
  VariantProps<typeof toastVariants>['variant']
>

const Toaster = (props: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: toastVariants({ variant: 'default' }),
          success: toastVariants({ variant: 'success' }),
          error: toastVariants({ variant: 'error' }),
          warning: toastVariants({ variant: 'warning' }),
          info: toastVariants({ variant: 'info' }),
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toastVariants }
