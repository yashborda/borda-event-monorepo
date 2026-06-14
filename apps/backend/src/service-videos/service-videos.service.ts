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
import { DriveService } from '../upload/drive.service.js';
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
    private readonly driveService: DriveService,
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
      const uploaded = await this.driveService.uploadVideo(file, service.name);
      driveFileId = uploaded.driveFileId;
      driveUrl = uploaded.driveUrl;
    }

    // If a themeId is provided, confirm it belongs to this service before insert.
    if (dto.themeId) {
      const [theme] = await this.drizzle.db
        .select({ id: serviceThemes.id })
        .from(serviceThemes)
        .where(
          and(
            eq(serviceThemes.id, dto.themeId),
            eq(serviceThemes.serviceId, serviceId),
          ),
        )
        .limit(1);
      if (!theme)
        throw new BadRequestException(
          'Theme does not belong to this service',
        );
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

    // For a drive video, delete the underlying Drive file first (by its drive
    // file id — there is no media_files row to route through).
    if (video.type === 'drive' && video.driveFileId) {
      await this.driveService.deleteDriveFile(video.driveFileId);
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
   * Rename a video. For Drive videos, the file is also renamed on Drive so
   * the user's Drive folder stays organised. For Instagram-linked videos,
   * only the DB title is updated (no file to rename).
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
      await this.driveService.renameFile(video.driveFileId, trimmed);
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
}
