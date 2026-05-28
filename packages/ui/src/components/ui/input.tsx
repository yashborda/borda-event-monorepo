'use client'

import { IconChevronDown, IconEye, IconEyeOff } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'
import { Popover } from 'radix-ui'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'
import { type ISelectOption } from './select'

const inputVariants = cva(
  'border-border bg-background text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 read-only:bg-muted read-only:text-muted-foreground read-only:cursor-not-allowed read-only:focus-visible:border-border read-only:focus-visible:ring-0 aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-body-sm file:h-6 file:text-body-sm',
        default: 'h-10 px-3 text-body-md file:h-8 file:text-body-md',
        lg: 'h-12 px-4 text-body-lg file:h-10 file:text-body-lg',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

const addonSizeClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'px-2.5 text-body-sm',
  default: 'px-3 text-body-md',
  lg: 'px-4 text-body-lg',
}

const iconSizeClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-3 [&_svg]:size-full',
  default: 'size-4 [&_svg]:size-full',
  lg: 'size-5 [&_svg]:size-full',
}

const iconInsetClass: Record<
  'left' | 'right',
  Record<'sm' | 'default' | 'lg', string>
> = {
  left: { sm: 'left-2', default: 'left-2.5', lg: 'left-3' },
  right: { sm: 'right-2', default: 'right-2.5', lg: 'right-3' },
}

const iconPaddingClass: Record<
  'left' | 'right',
  Record<'sm' | 'default' | 'lg', string>
> = {
  left: { sm: 'pl-7', default: 'pl-9', lg: 'pl-10' },
  right: { sm: 'pr-7', default: 'pr-9', lg: 'pr-10' },
}

const inlineSelectSizeClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'gap-1 px-2 text-body-sm',
  default: 'gap-1.5 px-2.5 text-body-md',
  lg: 'gap-2 px-3 text-body-lg',
}

const inlineSelectChevronClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-2.5',
  default: 'size-3',
  lg: 'size-3.5',
}

// ── Inline select ────────────────────────────────────────────────────────────

type IInlineSelectProps = {
  options: ISelectOption[]
  value?: string | null
  defaultValue?: string
  onChange?: (value: string | null) => void
  placeholder?: string
  size: 'sm' | 'default' | 'lg'
  position: 'left' | 'right'
  disabled?: boolean
}

const InlineSelect = ({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select…',
  size,
  position,
  disabled,
}: IInlineSelectProps) => {
  const [open, setOpen] = React.useState(false)
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<string | null>(
    defaultValue ?? null
  )
  const selected = isControlled ? value : internal
  const selectedOption = options.find((o) => o.value === selected) ?? null

  const pick = (val: string) => {
    if (!isControlled) setInternal(val)
    onChange?.(val)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        disabled={disabled}
        className={cn(
          'bg-muted text-foreground hover:bg-muted/80 flex shrink-0 cursor-pointer items-center transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          inlineSelectSizeClass[size],
          position === 'left'
            ? 'border-border rounded-l-md border-r'
            : 'border-border rounded-r-md border-l'
        )}
      >
        <span className="truncate">
          {selectedOption ? (
            selectedOption.label
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <IconChevronDown
          className={cn(
            'text-muted-foreground shrink-0 transition-transform duration-200',
            inlineSelectChevronClass[size],
            open && 'rotate-180'
          )}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          className="border-border bg-popover text-popover-foreground shadow-shadow z-50 min-w-32 overflow-hidden rounded-md border shadow-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-56 overflow-y-auto p-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => pick(opt.value)}
                className={cn(
                  'hover:bg-muted hover:text-foreground text-body-md flex w-full cursor-pointer items-center rounded px-2 py-1.5 transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  selected === opt.value && 'bg-muted'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ── Shared container (addon / inline-select wrapper) ─────────────────────────

const AddonContainer = ({
  isInvalid,
  children,
}: {
  isInvalid: boolean
  children: React.ReactNode
}) => (
  <div
    className={cn(
      'border-border bg-background flex w-full overflow-hidden rounded-md border transition-[color,box-shadow]',
      'has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-[3px]',
      isInvalid &&
        'border-destructive ring-destructive/20 dark:ring-destructive/40'
    )}
  >
    {children}
  </div>
)

// ── Input ────────────────────────────────────────────────────────────────────

type IInputClassNames = {
  root?: string
  label?: string
  input?: string
  addon?: string
  error?: string
}

type IInputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants> & {
    label?: string
    hint?: string
    hintIcon?: React.ReactNode
    errorMessage?: string
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
    addon?: React.ReactNode
    addonPosition?: 'left' | 'right'
    selectOptions?: ISelectOption[]
    selectValue?: string | null
    selectDefaultValue?: string
    onSelectChange?: (value: string | null) => void
    selectPlaceholder?: string
    selectPosition?: 'left' | 'right'
    classNames?: IInputClassNames
  }

const Input = ({
  className,
  type,
  size = 'default',
  label,
  hint,
  hintIcon,
  errorMessage,
  icon,
  iconPosition = 'right',
  addon,
  addonPosition = 'left',
  selectOptions,
  selectValue,
  selectDefaultValue,
  onSelectChange,
  selectPlaceholder,
  selectPosition = 'left',
  id,
  required,
  disabled,
  classNames,
  'aria-invalid': ariaInvalid,
  ...props
}: IInputProps) => {
  const resolvedSize = size ?? 'default'
  const resolvedIconPos = iconPosition ?? 'right'
  const isInvalid =
    !!errorMessage || ariaInvalid === 'true' || ariaInvalid === true

  // Borderless inner input — used inside addon / select containers
  const innerInput = (
    <div className="relative flex flex-1 items-center">
      <input
        id={id}
        type={type}
        data-slot="input"
        aria-invalid={isInvalid ? 'true' : undefined}
        required={required}
        disabled={disabled}
        className={cn(
          inputVariants({ size }),
          'rounded-none border-0 shadow-none focus-visible:ring-0',
          icon && iconPaddingClass[resolvedIconPos][resolvedSize],
          classNames?.input
        )}
        {...props}
      />
      {icon && (
        <span
          className={cn(
            'text-muted-foreground pointer-events-none absolute flex items-center',
            iconInsetClass[resolvedIconPos][resolvedSize]
          )}
        >
          <span className={iconSizeClass[resolvedSize]}>{icon}</span>
        </span>
      )}
    </div>
  )

  let inputEl: React.ReactNode

  if (type === 'password') {
    inputEl = (
      <PasswordInput
        id={id}
        size={size}
        disabled={disabled}
        aria-invalid={isInvalid ? 'true' : undefined}
        required={required}
        {...props}
      />
    )
  } else if (selectOptions) {
    const inlineSelect = (
      <InlineSelect
        options={selectOptions}
        value={selectValue}
        defaultValue={selectDefaultValue}
        onChange={onSelectChange}
        placeholder={selectPlaceholder}
        size={resolvedSize}
        position={selectPosition}
        disabled={disabled}
      />
    )

    inputEl = (
      <AddonContainer isInvalid={isInvalid}>
        {selectPosition === 'left' ? (
          <>
            {inlineSelect}
            {innerInput}
          </>
        ) : (
          <>
            {innerInput}
            {inlineSelect}
          </>
        )}
      </AddonContainer>
    )
  } else if (addon) {
    const addonEl = (
      <span
        className={cn(
          'border-border bg-muted text-muted-foreground flex shrink-0 items-center',
          addonSizeClass[resolvedSize],
          addonPosition === 'left'
            ? 'rounded-l-md border-r'
            : 'rounded-r-md border-l',
          classNames?.addon
        )}
      >
        {addon}
      </span>
    )

    inputEl = (
      <AddonContainer isInvalid={isInvalid}>
        {addonPosition === 'left' ? (
          <>
            {addonEl}
            {innerInput}
          </>
        ) : (
          <>
            {innerInput}
            {addonEl}
          </>
        )}
      </AddonContainer>
    )
  } else if (icon) {
    inputEl = (
      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          data-slot="input"
          aria-invalid={isInvalid ? 'true' : undefined}
          className={cn(
            inputVariants({ size }),
            iconPaddingClass[resolvedIconPos][resolvedSize],
            classNames?.input
          )}
          required={required}
          disabled={disabled}
          {...props}
        />
        <span
          className={cn(
            'text-muted-foreground pointer-events-none absolute flex items-center',
            iconInsetClass[resolvedIconPos][resolvedSize]
          )}
        >
          <span className={iconSizeClass[resolvedSize]}>{icon}</span>
        </span>
      </div>
    )
  } else {
    inputEl = (
      <input
        id={id}
        type={type}
        data-slot="input"
        aria-invalid={isInvalid ? 'true' : undefined}
        className={cn(inputVariants({ size }), classNames?.input)}
        required={required}
        disabled={disabled}
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        (label || errorMessage) && 'flex flex-col gap-1.5',
        className,
        classNames?.root
      )}
    >
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
      {inputEl}
      {errorMessage && (
        <p className={cn('text-body-sm text-destructive', classNames?.error)}>
          {errorMessage}
        </p>
      )}
    </div>
  )
}

// ── Password input ────────────────────────────────────────────────────────────

type IPasswordInputProps = Omit<IInputProps, 'label' | 'errorMessage'>

const PasswordInput = ({
  className,
  size = 'default',
  id,
  ...props
}: IPasswordInputProps) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className={cn('relative flex items-center', className)}>
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        data-slot="input"
        className={cn(inputVariants({ size }), 'pr-9')}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        onClick={() => setShowPassword((prev) => !prev)}
        className="text-muted-foreground hover:text-foreground absolute right-2.5 flex cursor-pointer items-center transition-colors"
      >
        {showPassword ? (
          <IconEyeOff className="size-4" />
        ) : (
          <IconEye className="size-4" />
        )}
      </button>
    </div>
  )
}

export { Input, inputVariants, type IInputProps, type IInputClassNames }
