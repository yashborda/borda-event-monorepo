import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  ne,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { adminUsers } from '../database/schema/admin-users.table.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { serviceMedia } from '../database/schema/service-media.table.js';
import { services } from '../database/schema/services.table.js';
import { generateSlug } from '../common/utils/slug.util.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadService } from '../upload/upload.service.js';
import type { CreateServiceDto } from './dto/create-service.dto.js';
import type { UpdateServiceDto } from './dto/update-service.dto.js';
import type { AttachServiceMediaDto } from './dto/attach-service-media.dto.js';
import type { ReorderServiceMediaDto } from './dto/reorder-service-media.dto.js';

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
export class ServicesService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly revalidationService: RevalidationService,
    private readonly uploadService: UploadService,
  ) {}

  async listAll(
    page = 1,
    limit = 20,
    search?: string,
    sortBy = 'updatedAt',
    sortDir: 'asc' | 'desc' = 'desc',
    includeDeleted = false,
    isActive?: boolean,
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'name'
        ? services.name
        : sortBy === 'basePrice'
          ? services.basePrice
          : sortBy === 'sortOrder'
            ? services.sortOrder
            : sortBy === 'createdAt'
              ? services.createdAt
              : sortBy === 'deletedAt'
                ? services.deletedAt
                : services.updatedAt;

    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(services.deletedAt));
    } else {
      conditions.push(isNotNull(services.deletedAt));
    }

    if (search) {
      conditions.push(ilike(services.name, `%${search}%`));
    }

    if (isActive !== undefined) {
      conditions.push(eq(services.isActive, isActive));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');
    const coverImg = alias(mediaFiles, 'cover_img');

    const mediaCountSubquery = sql<number>`(
      SELECT COUNT(*)::int
      FROM service_media
      WHERE service_media.service_id = ${services.id}
    )`;

    const [rows, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: services.id,
          name: services.name,
          slug: services.slug,
          coverImageId: coverImg.id,
          coverImageUrl: coverImg.url,
          coverImageFolder: coverImg.folder,
          coverImageOriginalName: coverImg.originalName,
          coverImageMimeType: coverImg.mimeType,
          coverImageSize: coverImg.size,
          basePrice: services.basePrice,
          isActive: services.isActive,
          sortOrder: services.sortOrder,
          createdBy: services.createdBy,
          createdByName: createdByUser.fullName,
          deletedAt: services.deletedAt,
          deletedReason: services.deletedReason,
          deletedBy: services.deletedBy,
          deletedByName: deletedByUser.fullName,
          createdAt: services.createdAt,
          updatedAt: services.updatedAt,
          mediaCount: mediaCountSubquery,
        })
        .from(services)
        .leftJoin(createdByUser, eq(services.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(services.deletedBy, deletedByUser.id))
        .leftJoin(coverImg, eq(services.coverImageId, coverImg.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(services)
        .where(whereClause),
    ]);

    return {
      data: rows.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        coverImage: mediaObject({
          id: s.coverImageId,
          url: s.coverImageUrl,
          folder: s.coverImageFolder,
          originalName: s.coverImageOriginalName,
          mimeType: s.coverImageMimeType,
          size: s.coverImageSize,
        }),
        basePrice: s.basePrice,
        isActive: s.isActive,
        sortOrder: s.sortOrder,
        createdBy: s.createdBy,
        createdByName: s.createdByName,
        deletedAt: s.deletedAt,
        deletedReason: s.deletedReason,
        deletedBy: s.deletedBy,
        deletedByName: s.deletedByName,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        mediaCount: s.mediaCount,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');
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
        isActive: services.isActive,
        sortOrder: services.sortOrder,
        createdBy: services.createdBy,
        createdByName: createdByUser.fullName,
        deletedAt: services.deletedAt,
        deletedReason: services.deletedReason,
        deletedBy: services.deletedBy,
        deletedByName: deletedByUser.fullName,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
      })
      .from(services)
      .leftJoin(createdByUser, eq(services.createdBy, createdByUser.id))
      .leftJoin(deletedByUser, eq(services.deletedBy, deletedByUser.id))
      .leftJoin(coverImg, eq(services.coverImageId, coverImg.id))
      .where(eq(services.id, id))
      .limit(1);

    if (!s) throw new NotFoundException('Service not found');

    const media = await this.fetchServiceMedia(id);

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
      isActive: s.isActive,
      sortOrder: s.sortOrder,
      createdBy: s.createdBy,
      createdByName: s.createdByName,
      deletedAt: s.deletedAt,
      deletedReason: s.deletedReason,
      deletedBy: s.deletedBy,
      deletedByName: s.deletedByName,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      media,
    };
  }

  async create(dto: CreateServiceDto, createdById?: string) {
    const slug = dto.slug ?? generateSlug(dto.name);

    const [existingSlug] = await this.drizzle.db
      .select()
      .from(services)
      .where(eq(services.slug, slug))
      .limit(1);

    if (existingSlug) throw new ConflictException('Slug already in use');

    const [service] = await this.drizzle.db
      .insert(services)
      .values({
        name: dto.name,
        slug,
        description: dto.description,
        coverImageId: dto.coverImageId,
        basePrice: dto.basePrice,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        createdBy: createdById,
      })
      .returning();

    const result = await this.findOne(service.id);
    this.revalidationService.revalidate(['services', `service-${result.slug}`]);
    return result;
  }

  async update(id: string, dto: UpdateServiceDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Service not found');
    if (existing.deletedAt)
      throw new BadRequestException('Cannot update a deleted service');

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.drizzle.db
        .select()
        .from(services)
        .where(and(eq(services.slug, dto.slug), ne(services.id, id)))
        .limit(1);

      if (slugConflict) throw new ConflictException('Slug already in use');
    }

    if (
      dto.coverImageId !== undefined &&
      dto.coverImageId !== existing.coverImageId &&
      existing.coverImageId
    ) {
      await this.uploadService.deleteFile(existing.coverImageId);
    }

    await this.drizzle.db
      .update(services)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.coverImageId !== undefined && {
          coverImageId: dto.coverImageId,
        }),
        ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        updatedAt: new Date(),
      })
      .where(eq(services.id, id));

    const result = await this.findOne(id);
    this.revalidationService.revalidate(['services', `service-${result.slug}`]);
    return result;
  }

  async softDelete(id: string, reason: string, deletedById?: string) {
    const [service] = await this.drizzle.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (!service) throw new NotFoundException('Service not found');
    if (service.deletedAt)
      throw new BadRequestException('Service is already deleted');

    await this.drizzle.db
      .update(services)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: deletedById,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id));

    this.revalidationService.revalidate(['services', `service-${service.slug}`]);
    return { message: 'Service deleted' };
  }

  async restore(id: string) {
    const [service] = await this.drizzle.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (!service) throw new NotFoundException('Service not found');
    if (!service.deletedAt)
      throw new BadRequestException('Service is not deleted');

    await this.drizzle.db
      .update(services)
      .set({
        deletedAt: null,
        deletedReason: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id));

    this.revalidationService.revalidate(['services', `service-${service.slug}`]);
    return { message: 'Service restored' };
  }

  async permanentDelete(id: string) {
    const [service] = await this.drizzle.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (!service) throw new NotFoundException('Service not found');
    if (!service.deletedAt)
      throw new BadRequestException(
        'Service must be soft-deleted before permanent deletion',
      );

    // service_media rows are removed automatically via ON DELETE cascade.
    await this.drizzle.db.delete(services).where(eq(services.id, id));

    if (service.coverImageId) {
      await this.uploadService.deleteFile(service.coverImageId);
    }

    this.revalidationService.revalidate(['services', `service-${service.slug}`]);
    return { message: 'Service permanently deleted' };
  }

  // ── Service media ──────────────────────────────────────────
  async attachMedia(id: string, dto: AttachServiceMediaDto) {
    const service = await this.getServiceOrThrow(id);

    const [media] = await this.drizzle.db
      .select({ id: mediaFiles.id })
      .from(mediaFiles)
      .where(eq(mediaFiles.id, dto.mediaId))
      .limit(1);

    if (!media) throw new NotFoundException('Media file not found');

    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const [{ maxOrder }] = await this.drizzle.db
        .select({
          maxOrder: sql<number>`COALESCE(MAX(${serviceMedia.sortOrder}), -1)::int`,
        })
        .from(serviceMedia)
        .where(eq(serviceMedia.serviceId, id));
      sortOrder = maxOrder + 1;
    }

    await this.drizzle.db
      .insert(serviceMedia)
      .values({ serviceId: id, mediaId: dto.mediaId, sortOrder })
      .onConflictDoUpdate({
        target: [serviceMedia.serviceId, serviceMedia.mediaId],
        set: { sortOrder },
      });

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return result;
  }

  async detachMedia(id: string, mediaId: string) {
    const service = await this.getServiceOrThrow(id);

    const deleted = await this.drizzle.db
      .delete(serviceMedia)
      .where(
        and(
          eq(serviceMedia.serviceId, id),
          eq(serviceMedia.mediaId, mediaId),
        ),
      )
      .returning();

    if (deleted.length === 0)
      throw new NotFoundException('Media is not attached to this service');

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return result;
  }

  async reorderMedia(id: string, dto: ReorderServiceMediaDto) {
    const service = await this.getServiceOrThrow(id);

    const attached = await this.drizzle.db
      .select({ mediaId: serviceMedia.mediaId })
      .from(serviceMedia)
      .where(eq(serviceMedia.serviceId, id));
    const attachedIds = new Set(attached.map((a) => a.mediaId));

    for (const mediaId of dto.mediaIds) {
      if (!attachedIds.has(mediaId))
        throw new BadRequestException(
          `Media ${mediaId} is not attached to this service`,
        );
    }

    await this.drizzle.db.transaction(async (tx) => {
      for (let i = 0; i < dto.mediaIds.length; i++) {
        await tx
          .update(serviceMedia)
          .set({ sortOrder: i })
          .where(
            and(
              eq(serviceMedia.serviceId, id),
              eq(serviceMedia.mediaId, dto.mediaIds[i]),
            ),
          );
      }
    });

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return result;
  }

  private async getServiceOrThrow(id: string) {
    const [service] = await this.drizzle.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (!service) throw new NotFoundException('Service not found');
    if (service.deletedAt)
      throw new BadRequestException('Cannot modify media of a deleted service');
    return service;
  }

  private async fetchServiceMedia(serviceId: string) {
    const rows = await this.drizzle.db
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
      .where(eq(serviceMedia.serviceId, serviceId))
      .orderBy(asc(serviceMedia.sortOrder));

    return rows.map((m) => ({
      id: m.id,
      url: m.url,
      folder: m.folder,
      originalName: m.originalName,
      mimeType: m.mimeType,
      size: m.size,
      sortOrder: m.sortOrder,
    }));
  }
}
