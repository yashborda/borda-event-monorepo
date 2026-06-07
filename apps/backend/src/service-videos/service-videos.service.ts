import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { serviceVideos } from '../database/schema/service-videos.table.js';
import { services } from '../database/schema/services.table.js';
import { DriveService } from '../upload/drive.service.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import type { CreateServiceVideoDto } from './dto/create-service-video.dto.js';
import type { ReorderServiceVideoItemDto } from './dto/reorder-service-videos.dto.js';

const videoColumns = {
  id: serviceVideos.id,
  serviceId: serviceVideos.serviceId,
  type: serviceVideos.type,
  instagramUrl: serviceVideos.instagramUrl,
  driveFileId: serviceVideos.driveFileId,
  driveUrl: serviceVideos.driveUrl,
  thumbnailId: serviceVideos.thumbnailId,
  thumbnailUrl: mediaFiles.url,
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

    // sort_order = max(existing) + 1
    const [{ maxOrder }] = await this.drizzle.db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${serviceVideos.sortOrder}), -1)::int`,
      })
      .from(serviceVideos)
      .where(eq(serviceVideos.serviceId, serviceId));

    const [inserted] = await this.drizzle.db
      .insert(serviceVideos)
      .values({
        serviceId,
        type: dto.type,
        instagramUrl,
        driveFileId,
        driveUrl,
        thumbnailId: dto.thumbnailId ?? null,
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
      type: r.type,
      instagramUrl: r.instagramUrl,
      driveFileId: r.driveFileId,
      driveUrl: r.driveUrl,
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
      instagramUrl: r.instagramUrl,
      driveUrl: r.driveUrl,
      sortOrder: r.sortOrder,
      thumbnail: r.thumbnailId
        ? { id: r.thumbnailId, url: r.thumbnailUrl }
        : null,
    }));
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
      type: r.type,
      instagramUrl: r.instagramUrl,
      driveFileId: r.driveFileId,
      driveUrl: r.driveUrl,
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
