import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { serviceVideos } from '../database/schema/service-videos.table.js';
import { serviceThemes } from '../database/schema/service-themes.table.js';
import { services } from '../database/schema/services.table.js';
import { R2Service } from '../upload/r2.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import type { CreateServiceVideoDto } from './dto/create-service-video.dto.js';
import type { ReorderServiceVideoItemDto } from './dto/reorder-service-videos.dto.js';

const videoColumns = {
  id: serviceVideos.id,
  serviceId: serviceVideos.serviceId,
  themeId: serviceVideos.themeId,
  type: serviceVideos.type,
  title: serviceVideos.title,
  instagramUrl: serviceVideos.instagramUrl,
  driveFileId: serviceVideos.driveFileId,
  driveUrl: serviceVideos.driveUrl,
  thumbnailId: serviceVideos.thumbnailId,
  thumbnailUrl: mediaFiles.url,
  isFeatured: serviceVideos.isFeatured,
  sortOrder: serviceVideos.sortOrder,
  createdBy: serviceVideos.createdBy,
  createdAt: serviceVideos.createdAt,
};

@Injectable()
export class ServiceVideosService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly r2Service: R2Service,
    private readonly revalidationService: RevalidationService,
  ) {}

  async create(
    serviceId: string,
    dto: CreateServiceVideoDto,
    file: Express.Multer.File | undefined,
    adminUserId?: string,
  ) {
    const service = await this.getServiceOrThrow(serviceId);

    let instagramUrl: string | null = null;
    let driveFileId: string | null = null;
    let driveUrl: string | null = null;

    // If a themeId is provided, confirm it belongs to this service (do this
    // before the upload so we can name the R2 object th-<themeNum>-NN).
    let theme: { id: string; name: string } | null = null;
    if (dto.themeId) {
      const [row] = await this.drizzle.db
        .select({ id: serviceThemes.id, name: serviceThemes.name })
        .from(serviceThemes)
        .where(
          and(
            eq(serviceThemes.id, dto.themeId),
            eq(serviceThemes.serviceId, serviceId),
          ),
        )
        .limit(1);
      if (!row)
        throw new BadRequestException(
          'Theme does not belong to this service',
        );
      theme = row;
    }

    if (dto.type === 'instagram') {
      if (!dto.instagramUrl)
        throw new BadRequestException(
          'instagramUrl is required for an instagram video',
        );
      instagramUrl = dto.instagramUrl;
    } else {
      if (!file)
        throw new BadRequestException(
          'A video file is required for a drive video',
        );

      // Readable R2 key for theme videos: th-<themeNum>-NN. Sequence continues
      // past existing videos already in this theme.
      let nameOpts: { namePrefix: string; startSeq: number } | undefined;
      if (theme) {
        const [{ count: videoCount }] = await this.drizzle.db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(serviceVideos)
          .where(
            and(
              eq(serviceVideos.serviceId, serviceId),
              eq(serviceVideos.themeId, theme.id),
            ),
          );
        nameOpts = {
          namePrefix: `th-${this.themeNumber(theme.name)}`,
          startSeq: videoCount + 1,
        };
      }

      const uploaded = await this.r2Service.uploadVideo(
        file,
        service.name,
        nameOpts,
      );
      driveFileId = uploaded.driveFileId;
      driveUrl = uploaded.driveUrl;
    }

    // sort_order = max(existing) + 1
    const [{ maxOrder }] = await this.drizzle.db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${serviceVideos.sortOrder}), -1)::int`,
      })
      .from(serviceVideos)
      .where(eq(serviceVideos.serviceId, serviceId));

    // First video uploaded to a theme is automatically the featured one.
    let isFeatured = false;
    if (dto.themeId) {
      const existingFeatured = await this.drizzle.db
        .select({ id: serviceVideos.id })
        .from(serviceVideos)
        .where(
          and(
            eq(serviceVideos.themeId, dto.themeId),
            eq(serviceVideos.isFeatured, true),
          ),
        )
        .limit(1);
      if (existingFeatured.length === 0) isFeatured = true;
    }

    const [inserted] = await this.drizzle.db
      .insert(serviceVideos)
      .values({
        serviceId,
        themeId: dto.themeId ?? null,
        type: dto.type,
        instagramUrl,
        driveFileId,
        driveUrl,
        thumbnailId: dto.thumbnailId ?? null,
        isFeatured,
        sortOrder: maxOrder + 1,
        createdBy: adminUserId,
      })
      .returning({ id: serviceVideos.id });

    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return this.findOne(inserted.id);
  }

  async findAll(serviceId: string) {
    const rows = await this.drizzle.db
      .select(videoColumns)
      .from(serviceVideos)
      .leftJoin(mediaFiles, eq(serviceVideos.thumbnailId, mediaFiles.id))
      .where(eq(serviceVideos.serviceId, serviceId))
      .orderBy(asc(serviceVideos.sortOrder));

    return rows.map((r) => ({
      id: r.id,
      serviceId: r.serviceId,
      themeId: r.themeId,
      type: r.type,
      title: r.title,
      instagramUrl: r.instagramUrl,
      driveFileId: r.driveFileId,
      driveUrl: r.driveUrl,
      isFeatured: r.isFeatured,
      sortOrder: r.sortOrder,
      createdBy: r.createdBy,
      createdAt: r.createdAt,
      thumbnail: r.thumbnailId
        ? { id: r.thumbnailId, url: r.thumbnailUrl }
        : null,
    }));
  }

  async reorder(serviceId: string, items: ReorderServiceVideoItemDto[]) {
    const service = await this.getServiceOrThrow(serviceId);

    // Validate every id belongs to this service.
    const ids = items.map((i) => i.id);
    const owned = await this.drizzle.db
      .select({ id: serviceVideos.id })
      .from(serviceVideos)
      .where(
        and(
          eq(serviceVideos.serviceId, serviceId),
          inArray(serviceVideos.id, ids),
        ),
      );
    const ownedIds = new Set(owned.map((o) => o.id));

    for (const item of items) {
      if (!ownedIds.has(item.id))
        throw new BadRequestException(
          `Video ${item.id} does not belong to this service`,
        );
    }

    await this.drizzle.db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(serviceVideos)
          .set({ sortOrder: item.sortOrder })
          .where(eq(serviceVideos.id, item.id));
      }
    });

    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return this.findAll(serviceId);
  }

  async remove(videoId: string, serviceId: string) {
    const [video] = await this.drizzle.db
      .select()
      .from(serviceVideos)
      .where(eq(serviceVideos.id, videoId))
      .limit(1);

    if (!video || video.serviceId !== serviceId)
      throw new NotFoundException('Service video not found');

    // For an uploaded video, delete the underlying R2 object first (by its
    // object key, stored in driveFileId — there is no media_files row to route
    // through).
    if (video.type === 'drive' && video.driveFileId) {
      await this.r2Service.deleteDriveFile(video.driveFileId);
    }

    await this.drizzle.db
      .delete(serviceVideos)
      .where(eq(serviceVideos.id, videoId));

    // If we just deleted the featured video for a theme, auto-promote the next
    // remaining video in that theme by sortOrder.
    if (video.isFeatured && video.themeId) {
      const [next] = await this.drizzle.db
        .select({ id: serviceVideos.id })
        .from(serviceVideos)
        .where(eq(serviceVideos.themeId, video.themeId))
        .orderBy(asc(serviceVideos.sortOrder))
        .limit(1);
      if (next) {
        await this.drizzle.db
          .update(serviceVideos)
          .set({ isFeatured: true })
          .where(eq(serviceVideos.id, next.id));
      }
    }

    const [service] = await this.drizzle.db
      .select({ slug: services.slug })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);
    if (service)
      this.revalidationService.revalidate([
        'services',
        `service-${service.slug}`,
      ]);

    return { message: 'Service video deleted' };
  }

  /**
   * Mark a video as featured for its theme. Transactionally unsets any existing
   * featured video in the same theme, then sets the chosen one. The video must
   * belong to this service AND be attached to a theme.
   */
  async setFeatured(videoId: string, serviceId: string) {
    const [video] = await this.drizzle.db
      .select({
        id: serviceVideos.id,
        serviceId: serviceVideos.serviceId,
        themeId: serviceVideos.themeId,
      })
      .from(serviceVideos)
      .where(eq(serviceVideos.id, videoId))
      .limit(1);
    if (!video || video.serviceId !== serviceId)
      throw new NotFoundException('Service video not found');
    if (!video.themeId)
      throw new BadRequestException(
        'Only videos attached to a theme can be featured',
      );

    await this.drizzle.db.transaction(async (tx) => {
      await tx
        .update(serviceVideos)
        .set({ isFeatured: false })
        .where(
          and(
            eq(serviceVideos.themeId, video.themeId!),
            eq(serviceVideos.isFeatured, true),
          ),
        );
      await tx
        .update(serviceVideos)
        .set({ isFeatured: true })
        .where(eq(serviceVideos.id, videoId));
    });

    const [service] = await this.drizzle.db
      .select({ slug: services.slug })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);
    if (service)
      this.revalidationService.revalidate([
        'services',
        `service-${service.slug}`,
      ]);

    return this.findOne(videoId);
  }

  async findAllPublic(serviceSlug: string) {
    // Resolve an active, non-deleted service by slug (matches website-services).
    const [service] = await this.drizzle.db
      .select({ id: services.id })
      .from(services)
      .where(
        and(
          eq(services.slug, serviceSlug),
          eq(services.isActive, true),
          isNull(services.deletedAt),
        ),
      )
      .limit(1);

    if (!service) return [];

    const rows = await this.drizzle.db
      .select(videoColumns)
      .from(serviceVideos)
      .leftJoin(mediaFiles, eq(serviceVideos.thumbnailId, mediaFiles.id))
      .where(eq(serviceVideos.serviceId, service.id))
      .orderBy(asc(serviceVideos.sortOrder));

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      instagramUrl: r.instagramUrl,
      driveUrl: r.driveUrl,
      isFeatured: r.isFeatured,
      sortOrder: r.sortOrder,
      thumbnail: r.thumbnailId
        ? { id: r.thumbnailId, url: r.thumbnailUrl }
        : null,
    }));
  }

  /**
   * Rename a video. Only the DB title is updated — R2 objects are immutable
   * and renaming would change the public URL, so storage is left untouched
   * (renameFile is a no-op on R2). Instagram-linked videos have no file either.
   */
  async rename(videoId: string, serviceId: string, title: string) {
    const [video] = await this.drizzle.db
      .select()
      .from(serviceVideos)
      .where(eq(serviceVideos.id, videoId))
      .limit(1);
    if (!video || video.serviceId !== serviceId)
      throw new NotFoundException('Service video not found');

    const trimmed = title.trim();
    if (!trimmed) throw new BadRequestException('Title cannot be empty');

    if (video.type === 'drive' && video.driveFileId) {
      await this.r2Service.renameFile(video.driveFileId, trimmed);
    }

    await this.drizzle.db
      .update(serviceVideos)
      .set({ title: trimmed })
      .where(eq(serviceVideos.id, videoId));

    const [service] = await this.drizzle.db
      .select({ slug: services.slug })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);
    if (service)
      this.revalidationService.revalidate([
        'services',
        `service-${service.slug}`,
      ]);

    return this.findOne(videoId);
  }

  private async findOne(videoId: string) {
    const [r] = await this.drizzle.db
      .select(videoColumns)
      .from(serviceVideos)
      .leftJoin(mediaFiles, eq(serviceVideos.thumbnailId, mediaFiles.id))
      .where(eq(serviceVideos.id, videoId))
      .limit(1);

    if (!r) throw new NotFoundException('Service video not found');

    return {
      id: r.id,
      serviceId: r.serviceId,
      themeId: r.themeId,
      type: r.type,
      title: r.title,
      instagramUrl: r.instagramUrl,
      driveFileId: r.driveFileId,
      driveUrl: r.driveUrl,
      isFeatured: r.isFeatured,
      sortOrder: r.sortOrder,
      createdBy: r.createdBy,
      createdAt: r.createdAt,
      thumbnail: r.thumbnailId
        ? { id: r.thumbnailId, url: r.thumbnailUrl }
        : null,
    };
  }

  private async getServiceOrThrow(serviceId: string) {
    const [service] = await this.drizzle.db
      .select({
        id: services.id,
        name: services.name,
        slug: services.slug,
        deletedAt: services.deletedAt,
      })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service) throw new NotFoundException('Service not found');
    if (service.deletedAt)
      throw new BadRequestException(
        'Cannot modify videos of a deleted service',
      );
    return service;
  }

  /** `baby-theme-07` → `07`; falls back to `01`. Zero-padded to 2+ digits. */
  private themeNumber(themeName: string): string {
    const m = themeName.match(/(\d+)\s*$/);
    const n = m ? parseInt(m[1], 10) : 1;
    return n < 100 ? String(n).padStart(2, '0') : String(n);
  }
}
