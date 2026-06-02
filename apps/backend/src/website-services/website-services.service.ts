import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { serviceMedia } from '../database/schema/service-media.table.js';
import { services } from '../database/schema/services.table.js';

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
export class WebsiteServicesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getServices() {
    const coverImg = alias(mediaFiles, 'cover_img');

    const rows = await this.drizzle.db
      .select({
        id: services.id,
        name: services.name,
        slug: services.slug,
        description: services.description,
        coverImageId: coverImg.id,
        coverImageUrl: coverImg.url,
        coverImageFolder: coverImg.folder,
        coverImageOriginalName: coverImg.originalName,
        coverImageMimeType: coverImg.mimeType,
        coverImageSize: coverImg.size,
        basePrice: services.basePrice,
        sortOrder: services.sortOrder,
      })
      .from(services)
      .leftJoin(coverImg, eq(services.coverImageId, coverImg.id))
      .where(and(eq(services.isActive, true), isNull(services.deletedAt)))
      .orderBy(asc(services.sortOrder));

    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      coverImage: mediaObject({
        id: s.coverImageId,
        url: s.coverImageUrl,
        folder: s.coverImageFolder,
        originalName: s.coverImageOriginalName,
        mimeType: s.coverImageMimeType,
        size: s.coverImageSize,
      }),
      basePrice: s.basePrice,
      sortOrder: s.sortOrder,
    }));
  }

  // Static route must come before /:slug
  async getSlugsForStaticParams() {
    const rows = await this.drizzle.db
      .select({ slug: services.slug })
      .from(services)
      .where(and(eq(services.isActive, true), isNull(services.deletedAt)));
    return rows.map((r) => r.slug);
  }

  async getServiceBySlug(slug: string) {
    const coverImg = alias(mediaFiles, 'cover_img');

    const [s] = await this.drizzle.db
      .select({
        id: services.id,
        name: services.name,
        slug: services.slug,
        description: services.description,
        coverImageId: coverImg.id,
        coverImageUrl: coverImg.url,
        coverImageFolder: coverImg.folder,
        coverImageOriginalName: coverImg.originalName,
        coverImageMimeType: coverImg.mimeType,
        coverImageSize: coverImg.size,
        basePrice: services.basePrice,
        sortOrder: services.sortOrder,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
      })
      .from(services)
      .leftJoin(coverImg, eq(services.coverImageId, coverImg.id))
      .where(
        and(
          eq(services.slug, slug),
          eq(services.isActive, true),
          isNull(services.deletedAt),
        ),
      )
      .limit(1);

    if (!s) throw new NotFoundException('Service not found');

    const mediaRows = await this.drizzle.db
      .select({
        id: mediaFiles.id,
        url: mediaFiles.url,
        folder: mediaFiles.folder,
        originalName: mediaFiles.originalName,
        mimeType: mediaFiles.mimeType,
        size: mediaFiles.size,
        sortOrder: serviceMedia.sortOrder,
      })
      .from(serviceMedia)
      .innerJoin(mediaFiles, eq(serviceMedia.mediaId, mediaFiles.id))
      .where(eq(serviceMedia.serviceId, s.id))
      .orderBy(asc(serviceMedia.sortOrder));

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      coverImage: mediaObject({
        id: s.coverImageId,
        url: s.coverImageUrl,
        folder: s.coverImageFolder,
        originalName: s.coverImageOriginalName,
        mimeType: s.coverImageMimeType,
        size: s.coverImageSize,
      }),
      basePrice: s.basePrice,
      sortOrder: s.sortOrder,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      media: mediaRows.map((m) => ({
        id: m.id,
        url: m.url,
        folder: m.folder,
        originalName: m.originalName,
        mimeType: m.mimeType,
        size: m.size,
        sortOrder: m.sortOrder,
      })),
    };
  }
}
