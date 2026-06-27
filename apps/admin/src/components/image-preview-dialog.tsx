'use client'

import { Dialog } from '@pkg/ui'

interface ImagePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string | null
  title?: string
}

/**
 * A simple lightbox: shows a single image at a comfortable size inside a
 * dialog. Used by ImageUpload (cover/banner thumbnails) and the themes table
 * so any small preview can be clicked to inspect the full picture.
 */
export function ImagePreviewDialog({
  open,
  onOpenChange,
  url,
  title,
}: ImagePreviewDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? 'Preview'}
      className="max-w-3xl"
    >
      {url ? (
        <div className="relative max-h-[75vh] w-full overflow-hidden rounded-md">
          {/* Plain <img> so any aspect ratio shows in full without cropping. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={title ?? 'Preview'}
            className="mx-auto max-h-[75vh] w-auto object-contain"
          />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No image to preview.</p>
      )}
    </Dialog>
  )
}
