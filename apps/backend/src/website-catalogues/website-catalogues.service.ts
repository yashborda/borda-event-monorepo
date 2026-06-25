import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { catalogues } from '../database/schema/catalogues.table.js';
import { catalogueServices } from '../database/schema/catalogue-services.table.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
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
export class WebsiteCataloguesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getCatalogues() {
    const coverImg = alias(mediaFiles, 'cover_img');

    const rows = await this.drizzle.db
      .select({
        id: catalogues.id,
        title: catalogues.title,
        slug: catalogues.slug,
        description: catalogues.description,
        coverImageId: coverImg.id,
        coverImageUrl: coverImg.url,
        coverImageFolder: coverImg.folder,
        coverImageOriginalName: coverImg.originalName,
        coverImageMimeType: coverImg.mimeType,
        coverImageSize: coverImg.size,
        viewCount: catalogues.viewCount,
      })
      .from(catalogues)
      .leftJoin(coverImg, eq(catalogues.coverImageId, coverImg.id))
      .where(and(eq(catalogues.isPublic, true), isNull(catalogues.deletedAt)))
      .orderBy(asc(catalogues.title));

    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      coverImage: mediaObject({
        id: c.coverImageId,
        url: c.coverImageUrl,
        folder: c.coverImageFolder,
        originalName: c.coverImageOriginalName,
        mimeType: c.coverImageMimeType,
        size: c.coverImageSize,
      }),
      viewCount: c.viewCount,
    }));
  }

  // Static route must come before /:slug
  async getSlugsForStaticParams() {
    const rows = await this.drizzle.db
      .select({ slug: catalogues.slug })
      .from(catalogues)
      .where(and(eq(catalogues.isPublic, true), isNull(catalogues.deletedAt)));
    return rows.map((r) => r.slug);
  }

  async getCatalogueBySlug(slug: string) {
    const coverImg = alias(mediaFiles, 'cover_img');

    // Only public, non-deleted catalogues are visible — a private one 404s so
    // its existence isn't leaked.
    const [c] = await this.drizzle.db
      .select({
        id: catalogues.id,
        title: catalogues.title,
        slug: catalogues.slug,
        description: catalogues.description,
        coverImageId: coverImg.id,
        coverImageUrl: coverImg.url,
        coverImageFolder: coverImg.folder,
        coverImageOriginalName: coverImg.originalName,
        coverImageMimeType: coverImg.mimeType,
        coverImageSize: coverImg.size,
      })
      .from(catalogues)
      .leftJoin(coverImg, eq(catalogues.coverImageId, coverImg.id))
      .where(
        and(
          eq(catalogues.slug, slug),
          eq(catalogues.isPublic, true),
          isNull(catalogues.deletedAt),
        ),
      )
      .limit(1);

    if (!c) throw new NotFoundException('Catalogue not found');

    // Increment view_count on every public fetch (atomic).
    const [{ viewCount }] = await this.drizzle.db
      .update(catalogues)
      .set({ viewCount: sql`${catalogues.viewCount} + 1` })
      .where(eq(catalogues.id, c.id))
      .returning({ viewCount: catalogues.viewCount });

    const catalogueServiceList = await this.fetchActiveServices(c.id);

    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      coverImage: mediaObject({
        id: c.coverImageId,
        url: c.coverImageUrl,
        folder: c.coverImageFolder,
        originalName: c.coverImageOriginalName,
        mimeType: c.coverImageMimeType,
        size: c.coverImageSize,
      }),
      viewCount,
      services: catalogueServiceList,
    };
  }

  private async fetchActiveServices(catalogueId: string) {
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
        sortOrder: catalogueServices.sortOrder,
      })
      .from(catalogueServices)
      .innerJoin(services, eq(catalogueServices.serviceId, services.id))
      .leftJoin(coverImg, eq(services.coverImageId, coverImg.id))
      .where(
        and(
          eq(catalogueServices.catalogueId, catalogueId),
          eq(services.isActive, true),
          isNull(services.deletedAt),
        ),
      )
      .orderBy(asc(catalogueServices.sortOrder));

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
      sortOrder: s.sortOrder,
    }));
  }
}
