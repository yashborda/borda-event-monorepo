'use client'

import { type VariantProps, cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

const textareaVariants = cva(
  'border-border bg-background text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 resize-y rounded-md border transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 read-only:bg-muted read-only:text-muted-foreground read-only:cursor-not-allowed read-only:focus-visible:border-border read-only:focus-visible:ring-0 aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        sm: 'min-h-[88px] px-2.5 py-2 text-body-sm',
        default: 'min-h-[112px] px-3 py-2.5 text-body-md',
        lg: 'min-h-[136px] px-4 py-3.5 text-body-lg',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

type ITextareaClassNames = {
  root?: string
  label?: string
  textarea?: string
  error?: string
}

type ITextareaProps = Omit<React.ComponentProps<'textarea'>, 'size'> &
  VariantProps<typeof textareaVariants> & {
    label?: string
    hint?: string
    hintIcon?: React.ReactNode
    errorMessage?: string
    classNames?: ITextareaClassNames
  }

const Textarea = ({
  className,
  size,
  label,
  hint,
  hintIcon,
  errorMessage,
  classNames,
  id,
  required,
  'aria-invalid': ariaInvalid,
  ...props
}: ITextareaProps) => {
  const isInvalid =
    !!errorMessage || ariaInvalid === 'true' || ariaInvalid === true

  const el = (
    <textarea
      id={id}
      data-slot="textarea"
      aria-invalid={isInvalid ? 'true' : undefined}
      className={cn(textareaVariants({ size }), classNames?.textarea)}
      required={required}
      {...props}
    />
  )

  if (label || errorMessage) {
    return (
      <div className={cn('flex flex-col gap-1.5', className, classNames?.root)}>
        {label && (
          <Label
            htmlFor={id}
            size={size}
            required={required}
            hint={hint}
            hintIcon={hintIcon}
            className={classNames?.label}
          >
            {label}
          </Label>
        )}
        {el}
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
  Textarea,
  textareaVariants,
  type ITextareaProps,
  type ITextareaClassNames,
}
