'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

type IDatePickerProps = {
  id?: string
  label?: string
  hint?: string
  errorMessage?: string
  /** ISO 8601 string */
  value?: string | null
  onChange?: (value: string | null) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const DatePicker = ({
  id,
  label,
  hint,
  errorMessage,
  value,
  onChange,
  disabled,
  required,
  className,
}: IDatePickerProps) => {
  const isInvalid = !!errorMessage

  const inputValue = React.useMemo(() => {
    if (!value) return ''
    try {
      return toLocalDateTimeString(new Date(value))
    } catch {
      return ''
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (!raw) {
      onChange?.(null)
      return
    }
    onChange?.(new Date(raw).toISOString())
  }

  return (
    <div
      className={cn(
        (label || errorMessage) && 'flex flex-col gap-1.5',
        className
      )}
    >
      {label && (
        <Label htmlFor={id} required={required} hint={hint}>
          {label}
        </Label>
      )}

      <input
        id={id}
        type="datetime-local"
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'border-border bg-background text-body-md text-foreground flex h-10 w-full rounded-md border px-3 transition-[color,box-shadow] outline-none',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-100',
          '[color-scheme:light] dark:[color-scheme:dark]',
          isInvalid &&
            'border-destructive ring-destructive/20 dark:ring-destructive/40',
          !inputValue && 'text-muted-foreground'
        )}
      />

      {errorMessage && (
        <p className="text-body-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}

export { DatePicker, type IDatePickerProps }
