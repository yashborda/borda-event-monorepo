import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { socialPosts } from '../database/schema/social-posts.table.js';

function mediaObject(
  row: {
    id: string | null;
    url: string | null;
    folder: string | null;
    originalName: string | null;
    mimeType: string | null;
    size: number | null;
  } | null,
) {
  if (!row?.id) return null;
  return {
    id: row.id,
    url: row.url!,
    folder: row.folder!,
    originalName: row.originalName!,
    mimeType: row.mimeType!,
    size: row.size!,
  };
}

@Injectable()
export class WebsiteSocialPostsService {
  constructor(private readonly drizzle: DrizzleService) {}

  // Featured posts only, in display order — for the public website.
  async getFeatured() {
    const thumb = alias(mediaFiles, 'thumb');

    const rows = await this.drizzle.db
      .select({
        id: socialPosts.id,
        platform: socialPosts.platform,
        postUrl: socialPosts.postUrl,
        caption: socialPosts.caption,
        sortOrder: socialPosts.sortOrder,
        thumbnailId: thumb.id,
        thumbnailUrl: thumb.url,
        thumbnailFolder: thumb.folder,
        thumbnailOriginalName: thumb.originalName,
        thumbnailMimeType: thumb.mimeType,
        thumbnailSize: thumb.size,
      })
      .from(socialPosts)
      .leftJoin(thumb, eq(socialPosts.thumbnailId, thumb.id))
      .where(eq(socialPosts.isFeatured, true))
      .orderBy(asc(socialPosts.sortOrder));

    return rows.map((p) => ({
      id: p.id,
      platform: p.platform,
      postUrl: p.postUrl,
      caption: p.caption,
      sortOrder: p.sortOrder,
      thumbnail: mediaObject({
        id: p.thumbnailId,
        url: p.thumbnailUrl,
        folder: p.thumbnailFolder,
        originalName: p.thumbnailOriginalName,
        mimeType: p.thumbnailMimeType,
        size: p.thumbnailSize,
      }),
    }));
  }
}
