'use client'

import type { IServiceThemeVideo } from '@pkg/types'
import { cn } from '@pkg/ui'
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlayFilled,
  IconX,
} from '@tabler/icons-react'

import Image from 'next/image'
import Script from 'next/script'

import * as React from 'react'

const IG_EMBED_SRC = 'https://www.instagram.com/embed.js'
const AUTOPLAY_MS = 6000

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

/** Normalise a reel/post URL to its bare permalink for the embed blockquote. */
const toPermalink = (url: string): string => {
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname.replace(/\/+$/, '')}/`
  } catch {
    return url
  }
}

const drivePoster = (fileId: string) =>
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`

/**
 * Drive video tile: a clean poster + single play button. Tapping opens the full
 * player in a modal — so the cramped inline Drive control bar never shows in the
 * narrow column (the cause of the overflowing controls on mobile).
 */
const DrivePoster = ({
  video,
  onPlay,
}: {
  video: IServiceThemeVideo
  onPlay: () => void
}) => (
  <button
    type="button"
    onClick={onPlay}
    aria-label={video.title ?? 'Play video'}
    className="group border-border/60 bg-brand-ink/5 relative block aspect-9/16 w-full overflow-hidden rounded-lg border shadow-sm"
  >
    {video.driveFileId && (
      <Image
        src={drivePoster(video.driveFileId)}
        alt={video.title ?? 'Video'}
        fill
        sizes="(max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    )}
    <span className="bg-brand-ink/25 group-hover:bg-brand-ink/35 absolute inset-0 flex items-center justify-center transition-colors">
      <span className="bg-brand-copper flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
        <IconPlayerPlayFilled className="size-7" />
      </span>
    </span>
  </button>
)

const InstagramEmbed = ({ url, title }: { url: string; title: string | null }) => {
  const permalink = toPermalink(url)
  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={permalink}
      data-instgrm-version="14"
      style={{
        background: '#fff',
        border: 0,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        margin: '0 auto',
        maxWidth: 360,
        minWidth: 0,
        width: '100%',
      }}
    >
      <a href={permalink}>{title ?? 'View reel on Instagram'}</a>
    </blockquote>
  )
}

/**
 * Video slider — one video per slide with prev/next arrows, dot indicators and
 * slow auto-advance. Instagram reels use the official embed; Drive videos show a
 * poster that opens the full player in a modal (no cramped inline controls).
 */
export const ThemeVideos = ({ videos }: { videos: IServiceThemeVideo[] }) => {
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const [playing, setPlaying] = React.useState<string | null>(null)

  const count = videos.length
  const active = videos[index]
  const isInstagram = active?.type === 'instagram' && !!active.instagramUrl

  const go = React.useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  )

  // Slow auto-advance, paused on hover or while a video modal is open.
  React.useEffect(() => {
    if (count <= 1 || paused || playing) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [count, paused, playing])

  // (Re)process the Instagram embed whenever the active reel changes.
  React.useEffect(() => {
    if (isInstagram) window.instgrm?.Embeds.process()
  }, [isInstagram, index])

  // Scroll lock + Esc close for the player modal.
  React.useEffect(() => {
    if (!playing) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlaying(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [playing])

  if (!count) return null

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {active.type === 'drive' && active.driveFileId ? (
        <DrivePoster
          key={active.id}
          video={active}
          onPlay={() => setPlaying(active.driveFileId)}
        />
      ) : active.instagramUrl ? (
        <InstagramEmbed
          key={active.id}
          url={active.instagramUrl}
          title={active.title}
        />
      ) : null}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous video"
            onClick={() => go(-1)}
            className="border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute top-1/2 left-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white"
          >
            <IconChevronLeft className="size-5" stroke={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next video"
            onClick={() => go(1)}
            className="border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute top-1/2 right-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white"
          >
            <IconChevronRight className="size-5" stroke={1.75} />
          </button>

          <div className="mt-3 flex justify-center gap-1.5">
            {videos.map((video, i) => (
              <button
                key={video.id}
                type="button"
                aria-label={`Go to video ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index
                    ? 'bg-brand-copper w-5'
                    : 'bg-brand-copper/30 hover:bg-brand-copper/60 w-1.5'
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* Full-screen Drive player — room for the controls. */}
      {playing && (
        <div
          onClick={() => setPlaying(null)}
          className="bg-brand-ink/90 fixed inset-0 z-80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setPlaying(null)}
            aria-label="Close"
            className="absolute top-4 right-4 rounded-md p-2 text-white/80 hover:text-white"
          >
            <IconX className="size-7" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative aspect-9/16 max-h-[85vh] w-full max-w-[min(360px,85vw)] overflow-hidden rounded-lg bg-black"
          >
            <iframe
              src={`https://drive.google.com/file/d/${playing}/preview`}
              allow="autoplay"
              allowFullScreen
              title="Video"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}

      <Script
        src={IG_EMBED_SRC}
        strategy="afterInteractive"
        onReady={() => window.instgrm?.Embeds.process()}
      />
    </div>
  )
}
