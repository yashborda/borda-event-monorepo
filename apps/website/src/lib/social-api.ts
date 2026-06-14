import type { IMediaFile } from '@pkg/types'

const BACKEND_URL =
  process.env['BACKEND_INTERNAL_URL'] ?? 'http://localhost:3002'

export type ISocialPostPublic = {
  id: string
  platform: 'instagram' | 'facebook' | 'youtube'
  postUrl: string
  caption: string | null
  sortOrder: number
  thumbnail: IMediaFile | null
}

/**
 * Featured social posts (Instagram reels etc.) managed in the admin.
 * Returns [] on failure so the home page renders fine with the backend down.
 */
export const getFeaturedSocialPosts = async (): Promise<
  ISocialPostPublic[]
> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/website/social-posts`, {
      next: { revalidate: 3600, tags: ['social-posts'] },
    })
    if (!res.ok) return []
    return (await res.json()) as ISocialPostPublic[]
  } catch {
    return []
  }
}
