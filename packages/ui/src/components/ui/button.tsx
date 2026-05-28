import { type VariantProps, cva } from 'class-variance-authority'

import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-body-md font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/80 focus-visible:ring-primary/20',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70 focus-visible:ring-secondary/20',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/80 focus-visible:ring-destructive/20',
        success:
          'bg-success text-success-foreground hover:bg-success/80 focus-visible:ring-success/20',
        warning:
          'bg-warning text-warning-foreground hover:bg-warning/80 focus-visible:ring-warning/20',
        info: 'bg-info text-info-foreground hover:bg-info/80 focus-visible:ring-info/20',
        accent:
          'bg-accent text-accent-foreground hover:bg-accent/80 focus-visible:ring-accent/20',
        muted:
          'bg-muted text-muted-foreground hover:bg-muted/70 focus-visible:ring-muted/20',
        // outline variants
        outline:
          'border border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary/20 focus-visible:border-primary',
        'outline-secondary':
          'border border-secondary bg-background text-secondary dark:text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground focus-visible:ring-secondary/20 focus-visible:border-secondary',
        'outline-accent':
          'border border-accent bg-background text-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent/20 focus-visible:border-accent',
        'outline-destructive':
          'border border-destructive bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-destructive/20 focus-visible:border-destructive',
        'outline-success':
          'border border-success bg-background text-success hover:bg-success hover:text-success-foreground focus-visible:ring-success/20 focus-visible:border-success',
        'outline-warning':
          'border border-warning bg-background text-warning hover:bg-warning hover:text-warning-foreground focus-visible:ring-warning/20 focus-visible:border-warning',
        'outline-info':
          'border border-info bg-background text-info hover:bg-info hover:text-info-foreground focus-visible:ring-info/20 focus-visible:border-info',
        'outline-muted':
          'border border-muted-foreground/30 bg-background text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-muted/20 focus-visible:border-muted-foreground/50',
        // ghost variants
        ghost:
          'bg-background text-primary hover:bg-primary/10 focus-visible:ring-primary/20',
        'ghost-secondary':
          'bg-background text-secondary dark:text-secondary-foreground hover:bg-secondary/10 focus-visible:ring-secondary/20 dark:hover:bg-secondary/30',
        'ghost-accent':
          'bg-background text-accent hover:bg-accent/10 focus-visible:ring-accent/20 dark:hover:bg-accent/10',
        'ghost-destructive':
          'bg-background text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/20 dark:hover:bg-destructive/10',
        'ghost-success':
          'bg-background text-success hover:bg-success/10 focus-visible:ring-success/20 dark:hover:bg-success/10',
        'ghost-warning':
          'bg-background text-warning hover:bg-warning/10 focus-visible:ring-warning/20 dark:hover:bg-warning/10',
        'ghost-info':
          'bg-background text-info hover:bg-info/10 focus-visible:ring-info/20 dark:hover:bg-info/10',
        'ghost-muted':
          'bg-background text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-muted/20',
        // link variants
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary/20',
        'link-secondary':
          'text-secondary dark:text-secondary-foreground underline-offset-4 hover:underline focus-visible:ring-secondary/20',
        'link-accent':
          'text-accent underline-offset-4 hover:underline focus-visible:ring-accent/20',
        'link-destructive':
          'text-destructive underline-offset-4 hover:underline focus-visible:ring-destructive/20',
        'link-success':
          'text-success underline-offset-4 hover:underline focus-visible:ring-success/20',
        'link-warning':
          'text-warning underline-offset-4 hover:underline focus-visible:ring-warning/20',
        'link-info':
          'text-info underline-offset-4 hover:underline focus-visible:ring-info/20',
        'link-muted':
          'text-muted-foreground underline-offset-4 hover:underline hover:text-foreground focus-visible:ring-muted/20',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        xl: 'h-12 rounded-md px-8 text-body-lg has-[>svg]:px-6',
        icon: 'size-9',
      },
      shape: {
        default: '',
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

export type IButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    icon?: React.ReactNode
    iconPosition?: 'start' | 'end'
  }

const Button = ({
  className,
  variant,
  size,
  shape,
  asChild = false,
  icon,
  iconPosition = 'start',
  children,
  ...props
}: IButtonProps) => {
  const Comp = asChild ? Slot : 'button'

  // When asChild + icon: clone the child element and inject the icon into its children
  // so Slot still receives a single React element.
  let resolvedChildren = children
  if (asChild && icon && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ children?: React.ReactNode }>
    const inner =
      iconPosition === 'start' ? (
        <>
          {icon}
          {child.props.children}
        </>
      ) : (
        <>
          {child.props.children}
          {icon}
        </>
      )
    resolvedChildren = React.cloneElement(child, {}, inner)
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    >
      {asChild ? (
        resolvedChildren
      ) : (
        <>
          {icon && iconPosition === 'start' && icon}
          {children}
          {icon && iconPosition === 'end' && icon}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
