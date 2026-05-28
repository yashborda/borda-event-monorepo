'use client'

import { type VariantProps, cva } from 'class-variance-authority'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

const radioItemVariants = cva(
  'peer aspect-square shrink-0 cursor-pointer rounded-full border border-input shadow-sm shadow-shadow transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary aria-invalid:border-destructive',
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

type IRadioGroupClassNames = {
  root?: string
  error?: string
}

type IRadioGroupItemClassNames = {
  root?: string
  item?: string
  label?: string
}

type IRadioGroupProps = React.ComponentProps<
  typeof RadioGroupPrimitive.Root
> & {
  errorMessage?: string
  classNames?: IRadioGroupClassNames
}

type IRadioGroupItemProps = React.ComponentProps<
  typeof RadioGroupPrimitive.Item
> &
  VariantProps<typeof radioItemVariants> & {
    label?: string
    hint?: string
    hintIcon?: React.ReactNode
    classNames?: IRadioGroupItemClassNames
  }

const RadioGroup = ({
  className,
  errorMessage,
  classNames,
  children,
  ...props
}: IRadioGroupProps) => (
  <div className={cn('flex flex-col gap-1', className, classNames?.root)}>
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className="flex flex-col gap-2"
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Root>
    {errorMessage && (
      <p className={cn('text-destructive text-body-sm', classNames?.error)}>
        {errorMessage}
      </p>
    )}
  </div>
)

const RadioGroupItem = ({
  className,
  size,
  label,
  hint,
  hintIcon,
  id,
  classNames,
  ...props
}: IRadioGroupItemProps) => {
  const el = (
    <RadioGroupPrimitive.Item
      id={id}
      data-slot="radio-group-item"
      className={cn(
        radioItemVariants({ size }),
        label ? undefined : className,
        classNames?.item
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="bg-primary-foreground size-1.5 rounded-full" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )

  if (label) {
    return (
      <div
        className={cn('flex items-center gap-2', className, classNames?.root)}
      >
        {el}
        <Label
          htmlFor={id}
          size={size}
          hint={hint}
          hintIcon={hintIcon}
          className={cn('cursor-pointer font-normal', classNames?.label)}
        >
          {label}
        </Label>
      </div>
    )
  }

  return el
}

export {
  RadioGroup,
  RadioGroupItem,
  type IRadioGroupProps,
  type IRadioGroupItemProps,
  type IRadioGroupClassNames,
  type IRadioGroupItemClassNames,
}
