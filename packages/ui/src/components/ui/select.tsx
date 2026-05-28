'use client'

import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'
import { Popover } from 'radix-ui'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

const selectTriggerVariants = cva(
  'border-border bg-background text-foreground flex w-full min-w-0 cursor-pointer items-center justify-between rounded-md border transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-body-sm gap-1.5',
        default: 'h-10 px-3 text-body-md gap-2',
        lg: 'h-12 px-4 text-body-lg gap-2.5',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

const clearIconClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-2.5',
  default: 'size-3',
  lg: 'size-3.5',
}

const chevronIconClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-3',
  default: 'size-4',
  lg: 'size-5',
}

type ISelectOption = {
  label: string
  value: string
  disabled?: boolean
}

type ISelectClassNames = {
  root?: string
  label?: string
  trigger?: string
  error?: string
}

type ISelectProps = Omit<React.ComponentProps<'button'>, 'size' | 'onChange'> &
  VariantProps<typeof selectTriggerVariants> & {
    options: ISelectOption[]
    value?: string | null
    defaultValue?: string
    onChange?: (value: string | null) => void
    placeholder?: string
    label?: string
    hint?: string
    hintIcon?: React.ReactNode
    errorMessage?: string
    searchable?: boolean
    required?: boolean
    clearable?: boolean
    showCheckmark?: boolean
    classNames?: ISelectClassNames
  }

const Select = ({
  className,
  size = 'default',
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select an option…',
  label,
  hint,
  hintIcon,
  errorMessage,
  searchable = false,
  id,
  required,
  disabled,
  clearable = false,
  showCheckmark = false,
  classNames,
  'aria-invalid': ariaInvalid,
  ...props
}: ISelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const searchRef = React.useRef<HTMLInputElement>(null)

  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<string | null>(
    defaultValue ?? null
  )

  // Keep internalValue in sync so clearing a controlled value
  // doesn't leave stale state when the component switches back to uncontrolled
  React.useEffect(() => {
    setInternalValue(value ?? null)
  }, [value])

  const selected = isControlled ? value : internalValue

  const isInvalid =
    !!errorMessage || ariaInvalid === 'true' || ariaInvalid === true
  const resolvedSize = size ?? 'default'

  const select = (optionValue: string) => {
    if (!isControlled) setInternalValue(optionValue)
    onChange?.(optionValue)
    setOpen(false)
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!isControlled) setInternalValue(null)
    onChange?.(null)
    setOpen(false)
  }

  const filteredOptions =
    searchable && search
      ? options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase())
        )
      : options

  const selectedOption = options.find((o) => o.value === selected) ?? null

  const trigger = (
    <Popover.Trigger
      id={id}
      disabled={disabled}
      aria-invalid={isInvalid ? 'true' : undefined}
      data-slot="select"
      className={cn(
        selectTriggerVariants({ size: resolvedSize }),
        !label && !errorMessage && className,
        classNames?.trigger
      )}
      {...props}
    >
      <span className="flex-1 truncate text-left">
        {selectedOption ? (
          selectedOption.label
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {clearable && selectedOption && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear selection"
            onClick={clear}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                clear(e as unknown as React.MouseEvent)
              }
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <IconX className={clearIconClass[resolvedSize]} />
          </span>
        )}
        <IconChevronDown
          className={cn(
            'text-muted-foreground transition-transform duration-200',
            chevronIconClass[resolvedSize],
            open && 'rotate-180'
          )}
        />
      </span>
    </Popover.Trigger>
  )

  const dropdown = (
    <Popover.Portal>
      <Popover.Content
        sideOffset={4}
        className="border-border bg-popover text-popover-foreground shadow-shadow z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border shadow-md"
        onOpenAutoFocus={(e) => {
          if (searchable) {
            e.preventDefault()
            searchRef.current?.focus()
          } else {
            e.preventDefault()
          }
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {searchable && (
          <div className="border-border border-b p-1.5">
            <input
              ref={searchRef}
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="placeholder:text-muted-foreground text-body-md w-full bg-transparent px-1.5 py-1 outline-none"
            />
          </div>
        )}
        <div className="max-h-56 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="text-muted-foreground text-body-md px-2 py-4 text-center">
              No options found.
            </p>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = selected === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => select(opt.value)}
                  className={cn(
                    'hover:bg-muted hover:text-foreground text-body-md flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    isSelected && 'bg-muted'
                  )}
                >
                  <span className="flex-1 text-left">{opt.label}</span>
                  {showCheckmark && isSelected && (
                    <IconCheck className="text-primary size-4 shrink-0" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </Popover.Content>
    </Popover.Portal>
  )

  if (label || errorMessage) {
    return (
      <div className={cn('flex flex-col gap-1.5', className, classNames?.root)}>
        {label && (
          <Label
            htmlFor={id}
            size={resolvedSize}
            required={required}
            hint={hint}
            hintIcon={hintIcon}
            className={classNames?.label}
          >
            {label}
          </Label>
        )}
        <Popover.Root open={open} onOpenChange={setOpen}>
          {trigger}
          {dropdown}
        </Popover.Root>
        {errorMessage && (
          <p className={cn('text-body-sm text-destructive', classNames?.error)}>
            {errorMessage}
          </p>
        )}
      </div>
    )
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      {trigger}
      {dropdown}
    </Popover.Root>
  )
}

export {
  Select,
  selectTriggerVariants,
  type ISelectProps,
  type ISelectOption,
  type ISelectClassNames,
}
