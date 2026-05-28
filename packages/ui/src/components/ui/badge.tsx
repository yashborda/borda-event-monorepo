import { type VariantProps, cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        // solid variants
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive:
          'bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        info: 'bg-info text-info-foreground',
        accent: 'bg-accent text-accent-foreground',
        muted: 'bg-muted text-muted-foreground',
        // ghost variants
        ghost: 'bg-primary/15 text-primary',
        'ghost-secondary':
          'bg-secondary/15 text-secondary dark:text-secondary-foreground',
        'ghost-accent': 'bg-accent/15 text-accent',
        'ghost-destructive': 'bg-destructive/15 text-destructive',
        'ghost-success': 'bg-success/15 text-success',
        'ghost-warning': 'bg-warning/15 text-warning',
        'ghost-info': 'bg-info/15 text-info',
        'ghost-muted': 'bg-muted/50 text-muted-foreground',
        // outline variants
        outline: 'border-primary text-primary',
        'outline-secondary':
          'border-secondary text-secondary dark:text-secondary-foreground',
        'outline-accent': 'border-accent text-accent',
        'outline-destructive': 'border-destructive text-destructive',
        'outline-success': 'border-success text-success',
        'outline-warning': 'border-warning text-warning',
        'outline-info': 'border-info text-info',
        'outline-muted': 'border-muted text-muted-foreground bg-background',
      },
      size: {
        sm: 'px-1.5 py-px text-body-xs [&>svg]:size-2.5',
        default: 'px-2 py-0.5 text-body-sm',
        lg: 'px-3 py-1 text-body-md [&>svg]:size-3.5',
      },
      shape: {
        default: 'rounded-md',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  }
)

export type IBadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>

const Badge = ({
  className,
  variant = 'default',
  size = 'default',
  shape = 'default',
  ...props
}: IBadgeProps) => (
  <span
    data-slot="badge"
    data-variant={variant}
    className={cn(badgeVariants({ variant, size, shape }), className)}
    {...props}
  />
)

export { Badge, badgeVariants }
