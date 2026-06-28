'use client'

import type { IServiceThemeVideo } from '@pkg/types'
import { cn } from '@pkg/ui'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

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

/**
 * Uploaded (R2-hosted) video: plays directly inline, muted + autoplay + loop so
 * it behaves like an ambient reel. `driveUrl` is the direct public file URL.
 * Native controls stay available for sound/scrubbing.
 */
const InlineVideo = ({
  video,
  fillHeight = false,
}: {
  video: IServiceThemeVideo
  fillHeight?: boolean
}) => {
  if (!video.driveUrl) return null
  // The #t=0.1 media fragment makes the browser seek to ~0.1s and paint that
  // frame as a poster, so the tile shows a still instead of a black box before
  // autoplay kicks in.
  const src = `${video.driveUrl}#t=0.1`
  return (
    <div
      className={cn(
        'border-border/60 bg-brand-ink/5 relative w-full overflow-hidden rounded-lg border shadow-sm',
        // Default: portrait reel everywhere. fillHeight: portrait on mobile,
        // but on desktop fill the sibling photo strip's height (aspect-auto +
        // h-full) so the video matches the photos instead of towering over them.
        fillHeight ? 'aspect-9/16 sm:aspect-auto sm:h-full' : 'aspect-9/16'
      )}
    >
      <video
        key={video.id}
        src={src}
        autoPlay
        muted
        playsInline
        controls
        preload="metadata"
        aria-label={video.title ?? 'Video'}
        className="absolute inset-0 h-full w-full bg-black object-cover"
      />
    </div>
  )
}

const InstagramEmbed = ({
  url,
  title,
}: {
  url: string
  title: string | null
}) => {
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
 * slow auto-advance. Instagram reels use the official embed; uploaded (R2)
 * videos play directly inline, muted + autoplay + loop.
 */
export const ThemeVideos = ({
  videos,
  fillHeight = false,
}: {
  videos: IServiceThemeVideo[]
  /** Fill the parent's height (h-full) instead of the default portrait aspect. */
  fillHeight?: boolean
}) => {
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  const count = videos.length
  const active = videos[index]
  const isInstagram = active?.type === 'instagram' && !!active.instagramUrl

  const go = React.useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  )

  // Slow auto-advance, paused on hover.
  React.useEffect(() => {
    if (count <= 1 || paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [count, paused])

  // (Re)process the Instagram embed whenever the active reel changes.
  React.useEffect(() => {
    if (isInstagram) window.instgrm?.Embeds.process()
  }, [isInstagram, index])

  if (!count) return null

  return (
    <div
      className={cn('relative', fillHeight && 'sm:h-full')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {active.type === 'drive' && active.driveUrl ? (
        <InlineVideo key={active.id} video={active} fillHeight={fillHeight} />
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
            className="border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute top-1/2 left-2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white sm:size-9"
          >
            <IconChevronLeft className="size-5" stroke={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next video"
            onClick={() => go(1)}
            className="border-brand-copper/40 text-brand-copper hover:bg-brand-copper absolute top-1/2 right-2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-md backdrop-blur transition-colors hover:text-white sm:size-9"
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

      <Script
        src={IG_EMBED_SRC}
        strategy="afterInteractive"
        onReady={() => window.instgrm?.Embeds.process()}
      />
    </div>
  )
}
