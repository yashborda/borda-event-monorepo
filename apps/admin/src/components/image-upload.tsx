'use client'

import type { IMediaFile } from '@pkg/types'
import { FileUpload, Label } from '@pkg/ui'
import { IconX } from '@tabler/icons-react'

import Image from 'next/image'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { cn } from '@/lib/utils'

import { useUpload } from '@/hooks/use-upload'

export type ImageUploadHandle = {
  /** IconUpload the pending file (if any) and return the IMediaFile.
   *  Returns the current value if no file is pending.
   *  Returns undefined if the upload fails (caller should abort save). */
  upload: () => Promise<IMediaFile | null | undefined>
}

interface ImageUploadProps {
  value?: IMediaFile | null
  onChange: (media: IMediaFile | null) => void
  folder?: string
  label?: string
  disabled?: boolean
  errorMessage?: string
  id?: string
  className?: string
  /** When true, file selection only stores the file locally for preview.
   *  The actual upload happens when `ref.upload()` is called. */
  deferred?: boolean
}

export const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(
  function ImageUpload(
    {
      value,
      onChange,
      folder = 'general',
      label,
      disabled,
      errorMessage,
      id,
      className,
      deferred = false,
    },
    ref
  ) {
    const { upload, uploading } = useUpload()
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const prevPreviewUrl = useRef<string | null>(null)

    // Revoke previous blob URL when it changes to avoid memory leaks
    useEffect(() => {
      const prev = prevPreviewUrl.current
      prevPreviewUrl.current = previewUrl
      if (prev && prev !== previewUrl) {
        URL.revokeObjectURL(prev)
      }
      return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewUrl])

    useImperativeHandle(ref, () => ({
      upload: async () => {
        if (!pendingFile) return value ?? null
        const media = await upload(pendingFile, folder)
        if (!media) return undefined // upload failed
        setPendingFile(null)
        setPreviewUrl(null)
        return media
      },
    }))

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (deferred) {
        const blob = URL.createObjectURL(file)
        setPendingFile(file)
        setPreviewUrl(blob)
        // Notify the form that an image is "staged" — pass a sentinel so the
        // field is treated as non-empty; the real media object replaces it on submit.
        onChange({
          id: '',
          url: blob,
          folder,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        })
      } else {
        const media = await upload(file, folder)
        if (media) onChange(media)
      }
    }

    const handleRemove = () => {
      if (pendingFile) {
        setPendingFile(null)
        setPreviewUrl(null)
      }
      onChange(null)
    }

    const displayUrl = previewUrl ?? value?.url ?? null
    const displayName =
      pendingFile?.name ??
      value?.originalName ??
      displayUrl?.split('/').pop() ??
      'image'
    const displaySize = pendingFile?.size ?? value?.size ?? null

    const formatSize = (bytes: number) => {
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    if (displayUrl) {
      return (
        <div className={`space-y-1.5${className ? ` ${className}` : ''}`}>
          {label && <Label>{label}</Label>}
          <div
            className={cn(
              'border-border flex items-center gap-3 rounded-md border p-3',
              disabled && 'bg-muted cursor-not-allowed'
            )}
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
              <Image
                src={displayUrl}
                alt={displayName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm text-foreground truncate font-medium">
                {displayName}
              </p>
              {displaySize !== null && (
                <p className="text-muted-foreground text-xs">
                  {formatSize(displaySize)}
                </p>
              )}
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
              >
                <IconX className="size-4" />
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <FileUpload
        id={id}
        label={label}
        accept="image/jpeg,image/png,image/webp,image/gif"
        maxSizeLabel="5 MB"
        disabled={disabled || uploading}
        errorMessage={errorMessage}
        onChange={handleFileChange}
        className={className}
      />
    )
  }
)
