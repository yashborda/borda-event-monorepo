'use client'

import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'
import { Popover } from 'radix-ui'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

const multiSelectTriggerVariants = cva(
  'border-border bg-background text-foreground flex w-full min-w-0 cursor-pointer items-center justify-between rounded-md border transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        sm: 'min-h-8 px-2.5 py-1.5 text-body-sm gap-1.5',
        default: 'min-h-10 px-3 py-2 text-body-md gap-2',
        lg: 'min-h-12 px-4 py-2.5 text-body-lg gap-2.5',
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

const chevronIconClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-3',
  default: 'size-4',
  lg: 'size-5',
}

type IMultiSelectOption = {
  label: string
  value: string
  disabled?: boolean
}

type IMultiSelectClassNames = {
  root?: string
  label?: string
  trigger?: string
  chip?: string
  error?: string
}

type IMultiSelectProps = Omit<
  React.ComponentProps<'button'>,
  'size' | 'onChange'
> &
  VariantProps<typeof multiSelectTriggerVariants> & {
    options: IMultiSelectOption[]
    value?: string[]
    defaultValue?: string[]
    onChange?: (value: string[]) => void
    placeholder?: string
    label?: string
    hint?: string
    hintIcon?: React.ReactNode
    errorMessage?: string
    searchable?: boolean
    required?: boolean
    maxDisplay?: number
    overflowLabel?: (count: number) => string
    selectAll?: boolean
    deselectAll?: boolean
    classNames?: IMultiSelectClassNames
  }

const MultiSelect = ({
  className,
  size = 'default',
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select options…',
  label,
  hint,
  hintIcon,
  errorMessage,
  searchable = false,
  id,
  required,
  disabled,
  maxDisplay,
  overflowLabel = (n) => `${n} items selected`,
  selectAll = false,
  deselectAll = false,
  classNames,
  'aria-invalid': ariaInvalid,
  ...props
}: IMultiSelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const searchRef = React.useRef<HTMLInputElement>(null)

  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<string[]>(
    defaultValue ?? []
  )
  const selected = isControlled ? value : internalValue

  const isInvalid =
    !!errorMessage || ariaInvalid === 'true' || ariaInvalid === true
  const resolvedSize = size ?? 'default'

  const toggle = (optionValue: string) => {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue]
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  const remove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = selected.filter((v) => v !== optionValue)
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  const filteredOptions =
    searchable && search
      ? options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase())
        )
      : options

  const selectableValues = options
    .filter((o) => !o.disabled)
    .map((o) => o.value)

  const handleSelectAll = () => {
    const next = Array.from(new Set([...selected, ...selectableValues]))
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  const handleDeselectAll = () => {
    if (!isControlled) setInternalValue([])
    onChange?.([])
  }

  const allSelected =
    selectableValues.length > 0 &&
    selectableValues.every((v) => selected.includes(v))
  const noneSelected = selected.length === 0

  const selectedOptions = options.filter((o) => selected.includes(o.value))
  const isOverflow =
    maxDisplay !== undefined && selectedOptions.length > maxDisplay

  const trigger = (
    <Popover.Trigger
      id={id}
      disabled={disabled}
      aria-invalid={isInvalid ? 'true' : undefined}
      data-slot="multi-select"
      className={cn(
        multiSelectTriggerVariants({ size: resolvedSize }),
        !label && !errorMessage && className,
        classNames?.trigger
      )}
      {...props}
    >
      <span className="flex flex-1 flex-wrap gap-1">
        {selectedOptions.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : isOverflow ? (
          <span
            className={cn(
              'bg-secondary text-secondary-foreground flex items-center rounded',
              chipSizeClass[resolvedSize],
              classNames?.chip
            )}
          >
            {overflowLabel(selectedOptions.length)}
          </span>
        ) : (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className={cn(
                'bg-secondary text-secondary-foreground flex items-center rounded',
                chipSizeClass[resolvedSize],
                classNames?.chip
              )}
            >
              {opt.label}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remove ${opt.label}`}
                onClick={(e) => remove(opt.value, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    remove(opt.value, e as unknown as React.MouseEvent)
                  }
                }}
                className="text-secondary-foreground/70 hover:text-secondary-foreground shrink-0 cursor-pointer transition-colors"
              >
                <IconX className={chipRemoveIconClass[resolvedSize]} />
              </span>
            </span>
          ))
        )}
      </span>
      <IconChevronDown
        className={cn(
          'text-muted-foreground shrink-0 transition-transform duration-200',
          chevronIconClass[resolvedSize],
          open && 'rotate-180'
        )}
      />
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
        {(selectAll || deselectAll) && (
          <div className="border-border flex items-center gap-1 border-b px-2 py-1.5">
            {selectAll && (
              <button
                type="button"
                disabled={allSelected}
                onClick={handleSelectAll}
                className="text-muted-foreground hover:text-foreground text-body-sm cursor-pointer rounded px-1 py-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                Select all
              </button>
            )}
            {selectAll && deselectAll && (
              <span className="text-border text-body-sm select-none">·</span>
            )}
            {deselectAll && (
              <button
                type="button"
                disabled={noneSelected}
                onClick={handleDeselectAll}
                className="text-muted-foreground hover:text-foreground text-body-sm cursor-pointer rounded px-1 py-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                Deselect all
              </button>
            )}
          </div>
        )}
        <div className="max-h-56 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="text-muted-foreground text-body-md px-2 py-4 text-center">
              No options found.
            </p>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = selected.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    'hover:bg-muted hover:text-foreground text-body-md flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    isSelected && 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'border-input flex size-4 shrink-0 items-center justify-center rounded border',
                      isSelected &&
                        'border-primary bg-primary text-primary-foreground'
                    )}
                  >
                    {isSelected && <IconCheck className="size-3" />}
                  </span>
                  {opt.label}
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
  MultiSelect,
  multiSelectTriggerVariants,
  type IMultiSelectProps,
  type IMultiSelectOption,
  type IMultiSelectClassNames,
}
