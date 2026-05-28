'use client'

import { IconCheck, IconMinus } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

const checkboxVariants = cva(
  'peer shrink-0 cursor-pointer rounded border border-input transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground aria-invalid:border-destructive',
  {
    variants: {
      size: {
        sm: 'size-3.5',
        default: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

type ICheckboxClassNames = {
  root?: string
  checkbox?: string
  label?: string
  error?: string
}

type ICheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants> & {
    label?: string
    hint?: string
    hintIcon?: React.ReactNode
    errorMessage?: string
    classNames?: ICheckboxClassNames
  }

const Checkbox = ({
  className,
  size,
  label,
  hint,
  hintIcon,
  errorMessage,
  id,
  classNames,
  'aria-invalid': ariaInvalid,
  ...props
}: ICheckboxProps) => {
  const isInvalid =
    !!errorMessage || ariaInvalid === 'true' || ariaInvalid === true

  const el = (
    <CheckboxPrimitive.Root
      id={id}
      data-slot="checkbox"
      aria-invalid={isInvalid ? 'true' : undefined}
      className={cn(checkboxVariants({ size }), classNames?.checkbox)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === 'indeterminate' ? (
          <IconMinus className="size-3" />
        ) : (
          <IconCheck className="size-3" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
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

export {
  Checkbox,
  checkboxVariants,
  type ICheckboxProps,
  type ICheckboxClassNames,
}
