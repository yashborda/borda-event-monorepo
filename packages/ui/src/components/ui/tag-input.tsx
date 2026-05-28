'use client'

import { IconX } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

const tagInputVariants = cva(
  'border-border bg-background text-foreground flex w-full min-w-0 flex-wrap items-center gap-1.5 rounded-md border shadow-sm shadow-shadow transition-[color,box-shadow] has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-[3px] aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        sm: 'min-h-8 px-2.5 py-1.5',
        default: 'min-h-10 px-3 py-2',
        lg: 'min-h-12 px-4 py-2.5',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

const chipSizeClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'px-1.5 py-0.5 text-body-sm gap-1',
  default: 'px-2 py-0.5 text-body-sm gap-1',
  lg: 'px-2 py-1 text-body-md gap-1.5',
}

const chipRemoveIconClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-2.5',
  default: 'size-3',
  lg: 'size-3.5',
}

const clearIconClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-2.5',
  default: 'size-3',
  lg: 'size-3.5',
}

const inputTextClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'text-body-sm',
  default: 'text-body-md',
  lg: 'text-body-lg',
}

type ITagInputClassNames = {
  root?: string
  label?: string
  container?: string
  input?: string
  chip?: string
  error?: string
}

type ITagInputProps = Omit<
  React.ComponentProps<'input'>,
  'size' | 'value' | 'defaultValue' | 'onChange'
> &
  VariantProps<typeof tagInputVariants> & {
    value?: string[]
    defaultValue?: string[]
    onChange?: (value: string[]) => void
    placeholder?: string
    label?: string
    hint?: string
    hintIcon?: React.ReactNode
    errorMessage?: string
    clearable?: boolean
    classNames?: ITagInputClassNames
  }

const TagInput = ({
  className,
  size,
  value,
  defaultValue,
  onChange,
  placeholder,
  label,
  hint,
  hintIcon,
  errorMessage,
  clearable = false,
  classNames,
  id,
  required,
  disabled,
  'aria-invalid': ariaInvalid,
  ...props
}: ITagInputProps) => {
  const resolvedSize = size ?? 'default'
  const isControlled = value !== undefined
  const [internalTags, setInternalTags] = React.useState<string[]>(
    defaultValue ?? []
  )
  const tags = isControlled ? value : internalTags

  const [inputValue, setInputValue] = React.useState('')
  const [highlightedIndex, setHighlightedIndex] = React.useState<number | null>(
    null
  )

  const isInvalid =
    !!errorMessage || ariaInvalid === 'true' || ariaInvalid === true

  const setTags = (next: string[]) => {
    if (!isControlled) setInternalTags(next)
    onChange?.(next)
  }

  const addTags = (raw: string) => {
    const incoming = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !tags.includes(s))
    if (incoming.length > 0) setTags([...tags, ...incoming])
    setInputValue('')
    setHighlightedIndex(null)
  }

  const remove = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
    setHighlightedIndex(null)
  }

  const clearAll = () => {
    setTags([])
    setHighlightedIndex(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) addTags(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '') {
      if (highlightedIndex !== null) {
        remove(highlightedIndex)
      } else if (tags.length > 0) {
        setHighlightedIndex(tags.length - 1)
      }
    } else {
      setHighlightedIndex(null)
    }
  }

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
      <div
        aria-invalid={isInvalid ? 'true' : undefined}
        className={cn(
          tagInputVariants({ size: resolvedSize }),
          classNames?.container
        )}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className={cn(
              'bg-secondary text-secondary-foreground flex items-center rounded transition-colors',
              chipSizeClass[resolvedSize],
              highlightedIndex === i && 'ring-destructive/50 ring-2',
              classNames?.chip
            )}
          >
            {tag}
            <span
              role="button"
              tabIndex={-1}
              aria-label={`Remove ${tag}`}
              onClick={() => remove(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  remove(i)
                }
              }}
              className="text-secondary-foreground/70 hover:text-secondary-foreground shrink-0 cursor-pointer transition-colors"
            >
              <IconX className={chipRemoveIconClass[resolvedSize]} />
            </span>
          </span>
        ))}
        <input
          id={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : undefined}
          disabled={disabled}
          required={required}
          className={cn(
            'placeholder:text-muted-foreground min-w-[80px] flex-1 bg-transparent outline-none disabled:cursor-not-allowed',
            inputTextClass[resolvedSize],
            classNames?.input
          )}
          {...props}
        />
        {clearable && tags.length > 0 && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear all"
            onClick={clearAll}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                clearAll()
              }
            }}
            className="text-muted-foreground hover:text-foreground ml-auto shrink-0 cursor-pointer transition-colors"
          >
            <IconX className={clearIconClass[resolvedSize]} />
          </span>
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

export {
  TagInput,
  tagInputVariants,
  type ITagInputProps,
  type ITagInputClassNames,
}
