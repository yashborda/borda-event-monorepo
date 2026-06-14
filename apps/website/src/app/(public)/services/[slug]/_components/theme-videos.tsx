import type { IServiceThemeVideo } from '@pkg/types'
import { IconBrandInstagram, IconPlayerPlayFilled } from '@tabler/icons-react'

import { MediaWithFallback } from '../../../_components/media-with-fallback'

/** Renders a theme's videos: Drive videos play inline, Instagram links out. */
export const ThemeVideos = ({ videos }: { videos: IServiceThemeVideo[] }) => {
  if (!videos.length) return null

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => {
        if (video.type === 'drive' && video.driveFileId) {
          return (
            <div
              key={video.id}
              className="border-border/60 overflow-hidden rounded-md border shadow-sm"
            >
              <div className="relative aspect-video">
                <iframe
                  src={`https://drive.google.com/file/d/${video.driveFileId}/preview`}
                  allow="autoplay"
                  allowFullScreen
                  title={video.title ?? 'Video'}
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              {video.title && (
                <p className="text-brand-ink p-3 text-sm font-medium">
                  {video.title}
                </p>
              )}
            </div>
          )
        }

        if (video.instagramUrl) {
          return (
            <a
              key={video.id}
              href={video.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={video.title ?? 'Open reel on Instagram'}
              className="group border-border/60 relative block aspect-[9/16] overflow-hidden rounded-md border shadow-sm"
            >
              <MediaWithFallback
                src={null}
                alt={video.title ?? 'Instagram reel'}
              />
              <div className="bg-brand-ink/25 group-hover:bg-brand-ink/40 absolute inset-0 flex items-center justify-center transition-colors">
                <IconPlayerPlayFilled className="size-10 text-white/90 drop-shadow" />
              </div>
              <IconBrandInstagram className="absolute top-2 right-2 size-5 text-white drop-shadow" />
            </a>
          )
        }

        return null
      })}
    </div>
  )
}
