'use client'

import { IconFile, IconPhoto, IconX } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Label } from './label'

const fileUploadVariants = cva(
  'border-border bg-background text-muted-foreground hover:bg-muted flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-muted has-[:disabled]:opacity-100 has-[:disabled]:hover:bg-muted',
  {
    variants: {
      size: {
        sm: 'px-3 py-4 text-body-sm',
        default: 'px-4 py-6 text-body-md',
        lg: 'px-5 py-8 text-body-lg',
      },
      invalid: {
        true: 'border-destructive text-destructive hover:bg-destructive/5',
        false: '',
      },
    },
    defaultVariants: { size: 'default', invalid: false },
  }
)

const uploadIconSizeClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-6',
  default: 'size-8',
  lg: 'size-10',
}

const fileIconSizeClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'size-3.5',
  default: 'size-4',
  lg: 'size-5',
}

const fileItemClass: Record<'sm' | 'default' | 'lg', string> = {
  sm: 'px-2.5 py-1.5 text-body-sm',
  default: 'px-3 py-2 text-body-md',
  lg: 'px-4 py-3 text-body-lg',
}

const getAcceptLabel = (accept?: string): string => {
  if (!accept) return ''
  return accept
    .split(',')
    .map((t) => {
      t = t.trim()
      if (t === 'image/*') return 'Images'
      if (t === 'video/*') return 'Videos'
      if (t === 'audio/*') return 'Audio'
      if (t.startsWith('.')) return t.slice(1).toUpperCase()
      if (t.includes('/')) return t.split('/')[1].toUpperCase()
      return t.toUpperCase()
    })
    .join(', ')
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type IFileUploadClassNames = {
  root?: string
  label?: string
  dropzone?: string
  fileList?: string
  fileItem?: string
  error?: string
}

type IFileUploadProps = Omit<
  React.ComponentProps<'input'>,
  'type' | 'aria-invalid' | 'size'
> &
  VariantProps<typeof fileUploadVariants> & {
    label?: string
    hint?: string
    hintIcon?: React.ReactNode
    errorMessage?: string
    maxSizeLabel?: string
    classNames?: IFileUploadClassNames
  }

const FileUpload = ({
  className,
  size,
  label,
  hint,
  hintIcon,
  errorMessage,
  maxSizeLabel,
  id,
  required,
  multiple,
  onChange,
  disabled,
  accept,
  classNames,
  ...props
}: IFileUploadProps) => {
  const resolvedSize = size ?? 'default'
  const acceptLabel = getAcceptLabel(accept)
  const isInvalid = !!errorMessage
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [files, setFiles] = React.useState<File[]>([])

  const hintParts = [acceptLabel, maxSizeLabel ? `up to ${maxSizeLabel}` : '']
    .filter(Boolean)
    .join(' ')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? [])
    setFiles(multiple ? (prev) => [...prev, ...incoming] : incoming)
    onChange?.(e)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    if (inputRef.current) inputRef.current.value = ''
  }

  const dropZone = (
    <label
      htmlFor={id}
      className={cn(
        fileUploadVariants({ size, invalid: isInvalid }),
        disabled && 'bg-muted cursor-not-allowed opacity-100',
        classNames?.dropzone
      )}
    >
      <IconPhoto
        className={cn('shrink-0', uploadIconSizeClass[resolvedSize])}
        stroke={1.5}
      />
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span>
          <span className="text-primary font-medium underline">
            Upload a file
          </span>{' '}
          or drag and drop
        </span>
        {hintParts && <span className="opacity-60">{hintParts}</span>}
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        required={required}
        multiple={multiple}
        disabled={disabled}
        accept={accept}
        aria-invalid={isInvalid ? 'true' : undefined}
        onChange={handleChange}
        {...props}
      />
    </label>
  )

  const fileList = files.length > 0 && (
    <ul className={cn('flex flex-col gap-1.5', classNames?.fileList)}>
      {files.map((file, i) => (
        <li
          key={`${file.name}-${i}`}
          className={cn(
            'border-border bg-muted/50 flex items-center gap-2 rounded-md border',
            fileItemClass[resolvedSize],
            classNames?.fileItem
          )}
        >
          <IconFile
            className={cn(
              'text-muted-foreground shrink-0',
              fileIconSizeClass[resolvedSize]
            )}
          />
          <span className="text-foreground min-w-0 flex-1 truncate">
            {file.name}
          </span>
          <span className="text-muted-foreground shrink-0 tabular-nums">
            {formatFileSize(file.size)}
          </span>
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={() => removeFile(i)}
            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-colors"
          >
            <IconX className={fileIconSizeClass[resolvedSize]} />
          </button>
        </li>
      ))}
    </ul>
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
        {dropZone}
        {fileList}
        {errorMessage && (
          <p className={cn('text-body-sm text-destructive', classNames?.error)}>
            {errorMessage}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className, classNames?.root)}>
      {dropZone}
      {fileList}
    </div>
  )
}

export {
  FileUpload,
  fileUploadVariants,
  type IFileUploadProps,
  type IFileUploadClassNames,
}
