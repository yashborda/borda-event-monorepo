'use client'

import { type VariantProps, cva } from 'class-variance-authority'
import { Switch as SwitchPrimitive } from 'radix-ui'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-40 data-[state=unchecked]:bg-input',
  {
    variants: {
      size: {
        sm: 'h-4 w-7',
        default: 'h-5 w-9',
        lg: 'h-6 w-11',
      },
      color: {
        primary:
          'data-[state=checked]:bg-primary focus-visible:border-primary focus-visible:ring-primary/30',
        secondary:
          'data-[state=checked]:bg-secondary focus-visible:border-secondary focus-visible:ring-secondary/30',
        destructive:
          'data-[state=checked]:bg-destructive focus-visible:border-destructive focus-visible:ring-destructive/30',
        success:
          'data-[state=checked]:bg-success focus-visible:border-success focus-visible:ring-success/30',
        warning:
          'data-[state=checked]:bg-warning focus-visible:border-warning focus-visible:ring-warning/30',
        info: 'data-[state=checked]:bg-info focus-visible:border-info focus-visible:ring-info/30',
        accent:
          'data-[state=checked]:bg-accent focus-visible:border-accent focus-visible:ring-accent/30',
      },
    },
    defaultVariants: { size: 'default', color: 'primary' },
  }
)

const switchThumbVariants = cva(
  'pointer-events-none flex items-center justify-center rounded-full shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'size-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
        default:
          'size-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        lg: 'size-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      },
      color: {
        primary: 'bg-white dark:data-[state=checked]:bg-primary-foreground',
        secondary: 'bg-white',
        destructive: 'bg-white',
        success: 'bg-white',
        warning: 'bg-white',
        info: 'bg-white',
        accent: 'bg-white',
      },
    },
    defaultVariants: { size: 'default', color: 'primary' },
  }
)

const thumbIconSizeClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-2',
  default: 'size-2.5',
  lg: 'size-3',
}

type ISwitchClassNames = {
  root?: string
  track?: string
  thumb?: string
  label?: string
  error?: string
}

type ISwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  'checked' | 'defaultChecked' | 'onCheckedChange'
> &
  VariantProps<typeof switchVariants> & {
    label?: string
    hint?: string
    hintIcon?: React.ReactNode
    errorMessage?: string
    checkedIcon?: React.ReactNode
    uncheckedIcon?: React.ReactNode
    checked?: boolean
    defaultChecked?: boolean
    onCheckedChange?: (checked: boolean) => void
    color?:
      | 'primary'
      | 'secondary'
      | 'destructive'
      | 'success'
      | 'warning'
      | 'info'
      | 'accent'
    classNames?: ISwitchClassNames
  }

const Switch = ({
  className,
  size,
  color,
  label,
  hint,
  hintIcon,
  errorMessage,
  id,
  checkedIcon,
  uncheckedIcon,
  checked,
  defaultChecked,
  onCheckedChange,
  classNames,
  ...props
}: ISwitchProps) => {
  const resolvedSize = size ?? 'default'
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = React.useState(
    defaultChecked ?? false
  )
  const isChecked = isControlled ? checked : internalChecked

  const handleCheckedChange = (val: boolean) => {
    if (!isControlled) setInternalChecked(val)
    onCheckedChange?.(val)
  }

  const icon = isChecked ? checkedIcon : uncheckedIcon

  const el = (
    <SwitchPrimitive.Root
      id={id}
      data-slot="switch"
      checked={isChecked}
      onCheckedChange={handleCheckedChange}
      className={cn(switchVariants({ size, color }), classNames?.track)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(switchThumbVariants({ size, color }), classNames?.thumb)}
      >
        {icon && (
          <span
            className={cn(
              'flex items-center justify-center',
              thumbIconSizeClass[resolvedSize]
            )}
          >
            {icon}
          </span>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )

  if (label || errorMessage) {
    return (
      <div className={cn('flex flex-col gap-1', className, classNames?.root)}>
        <div className="flex items-center gap-2">
          {el}
          {label && (
            <Label
              htmlFor={id}
              size={size}
              hint={hint}
              hintIcon={hintIcon}
              className={cn('cursor-pointer font-normal', classNames?.label)}
            >
              {label}
            </Label>
          )}
        </div>
        {errorMessage && (
          <p className={cn('text-body-sm text-destructive', classNames?.error)}>
            {errorMessage}
          </p>
        )}
      </div>
    )
  }

  return el
}

export { Switch, switchVariants, type ISwitchProps, type ISwitchClassNames }
