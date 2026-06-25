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
import { catalogues } from '../database/schema/catalogues.table.js';
import { catalogueServices } from '../database/schema/catalogue-services.table.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { services } from '../database/schema/services.table.js';
import { generateSlug } from '../common/utils/slug.util.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadService } from '../upload/upload.service.js';
import type { CreateCatalogueDto } from './dto/create-catalogue.dto.js';
import type { UpdateCatalogueDto } from './dto/update-catalogue.dto.js';
import type { AttachCatalogueServiceDto } from './dto/attach-catalogue-service.dto.js';
import type { ReorderCatalogueServicesDto } from './dto/reorder-catalogue-services.dto.js';

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
export class CataloguesService {
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
    isPublic?: boolean,
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'title'
        ? catalogues.title
        : sortBy === 'viewCount'
          ? catalogues.viewCount
          : sortBy === 'createdAt'
            ? catalogues.createdAt
            : sortBy === 'deletedAt'
              ? catalogues.deletedAt
              : catalogues.updatedAt;

    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(catalogues.deletedAt));
    } else {
      conditions.push(isNotNull(catalogues.deletedAt));
    }

    if (search) {
      conditions.push(ilike(catalogues.title, `%${search}%`));
    }

    if (isPublic !== undefined) {
      conditions.push(eq(catalogues.isPublic, isPublic));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');
    const coverImg = alias(mediaFiles, 'cover_img');

    const serviceCountSubquery = sql<number>`(
      SELECT COUNT(*)::int
      FROM catalogue_services
      WHERE catalogue_services.catalogue_id = ${catalogues.id}
    )`;

    const [rows, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: catalogues.id,
          title: catalogues.title,
          slug: catalogues.slug,
          coverImageId: coverImg.id,
          coverImageUrl: coverImg.url,
          coverImageFolder: coverImg.folder,
          coverImageOriginalName: coverImg.originalName,
          coverImageMimeType: coverImg.mimeType,
          coverImageSize: coverImg.size,
          isPublic: catalogues.isPublic,
          viewCount: catalogues.viewCount,
          createdBy: catalogues.createdBy,
          createdByName: createdByUser.fullName,
          deletedAt: catalogues.deletedAt,
          deletedReason: catalogues.deletedReason,
          deletedBy: catalogues.deletedBy,
          deletedByName: deletedByUser.fullName,
          createdAt: catalogues.createdAt,
          updatedAt: catalogues.updatedAt,
          serviceCount: serviceCountSubquery,
        })
        .from(catalogues)
        .leftJoin(createdByUser, eq(catalogues.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(catalogues.deletedBy, deletedByUser.id))
        .leftJoin(coverImg, eq(catalogues.coverImageId, coverImg.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(catalogues)
        .where(whereClause),
    ]);

    return {
      data: rows.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        coverImage: mediaObject({
          id: c.coverImageId,
          url: c.coverImageUrl,
          folder: c.coverImageFolder,
          originalName: c.coverImageOriginalName,
          mimeType: c.coverImageMimeType,
          size: c.coverImageSize,
        }),
        isPublic: c.isPublic,
        viewCount: c.viewCount,
        createdBy: c.createdBy,
        createdByName: c.createdByName,
        deletedAt: c.deletedAt,
        deletedReason: c.deletedReason,
        deletedBy: c.deletedBy,
        deletedByName: c.deletedByName,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        serviceCount: c.serviceCount,
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
        isPublic: catalogues.isPublic,
        viewCount: catalogues.viewCount,
        createdBy: catalogues.createdBy,
        createdByName: createdByUser.fullName,
        deletedAt: catalogues.deletedAt,
        deletedReason: catalogues.deletedReason,
        deletedBy: catalogues.deletedBy,
        deletedByName: deletedByUser.fullName,
        createdAt: catalogues.createdAt,
        updatedAt: catalogues.updatedAt,
      })
      .from(catalogues)
      .leftJoin(createdByUser, eq(catalogues.createdBy, createdByUser.id))
      .leftJoin(deletedByUser, eq(catalogues.deletedBy, deletedByUser.id))
      .leftJoin(coverImg, eq(catalogues.coverImageId, coverImg.id))
      .where(eq(catalogues.id, id))
      .limit(1);

    if (!c) throw new NotFoundException('Catalogue not found');

    const catalogueServiceList = await this.fetchCatalogueServices(id);

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
      isPublic: c.isPublic,
      viewCount: c.viewCount,
      createdBy: c.createdBy,
      createdByName: c.createdByName,
      deletedAt: c.deletedAt,
      deletedReason: c.deletedReason,
      deletedBy: c.deletedBy,
      deletedByName: c.deletedByName,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      services: catalogueServiceList,
    };
  }

  async create(dto: CreateCatalogueDto, createdById?: string) {
    const slug = dto.slug ?? generateSlug(dto.title);

    const [existingSlug] = await this.drizzle.db
      .select()
      .from(catalogues)
      .where(eq(catalogues.slug, slug))
      .limit(1);

    if (existingSlug) throw new ConflictException('Slug already in use');

    const [catalogue] = await this.drizzle.db
      .insert(catalogues)
      .values({
        title: dto.title,
        slug,
        description: dto.description,
        coverImageId: dto.coverImageId,
        isPublic: dto.isPublic ?? false,
        createdBy: createdById,
      })
      .returning();

    const result = await this.findOne(catalogue.id);
    this.revalidationService.revalidate([
      'catalogues',
      `catalogue-${result.slug}`,
    ]);
    return result;
  }

  async update(id: string, dto: UpdateCatalogueDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(catalogues)
      .where(eq(catalogues.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Catalogue not found');
    if (existing.deletedAt)
      throw new BadRequestException('Cannot update a deleted catalogue');

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.drizzle.db
        .select()
        .from(catalogues)
        .where(and(eq(catalogues.slug, dto.slug), ne(catalogues.id, id)))
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
      .update(catalogues)
      .set({
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.coverImageId !== undefined && {
          coverImageId: dto.coverImageId,
        }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        updatedAt: new Date(),
      })
      .where(eq(catalogues.id, id));

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'catalogues',
      `catalogue-${result.slug}`,
    ]);
    return result;
  }

  async softDelete(id: string, reason: string, deletedById?: string) {
    const [catalogue] = await this.drizzle.db
      .select()
      .from(catalogues)
      .where(eq(catalogues.id, id))
      .limit(1);

    if (!catalogue) throw new NotFoundException('Catalogue not found');
    if (catalogue.deletedAt)
      throw new BadRequestException('Catalogue is already deleted');

    await this.drizzle.db
      .update(catalogues)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: deletedById,
        updatedAt: new Date(),
      })
      .where(eq(catalogues.id, id));

    this.revalidationService.revalidate([
      'catalogues',
      `catalogue-${catalogue.slug}`,
    ]);
    return { message: 'Catalogue deleted' };
  }

  async restore(id: string) {
    const [catalogue] = await this.drizzle.db
      .select()
      .from(catalogues)
      .where(eq(catalogues.id, id))
      .limit(1);

    if (!catalogue) throw new NotFoundException('Catalogue not found');
    if (!catalogue.deletedAt)
      throw new BadRequestException('Catalogue is not deleted');

    await this.drizzle.db
      .update(catalogues)
      .set({
        deletedAt: null,
        deletedReason: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(catalogues.id, id));

    this.revalidationService.revalidate([
      'catalogues',
      `catalogue-${catalogue.slug}`,
    ]);
    return { message: 'Catalogue restored' };
  }

  async permanentDelete(id: string) {
    const [catalogue] = await this.drizzle.db
      .select()
      .from(catalogues)
      .where(eq(catalogues.id, id))
      .limit(1);

    if (!catalogue) throw new NotFoundException('Catalogue not found');
    if (!catalogue.deletedAt)
      throw new BadRequestException(
        'Catalogue must be soft-deleted before permanent deletion',
      );

    // catalogue_services rows are removed automatically via ON DELETE cascade.
    await this.drizzle.db.delete(catalogues).where(eq(catalogues.id, id));

    if (catalogue.coverImageId) {
      await this.uploadService.deleteFile(catalogue.coverImageId);
    }

    this.revalidationService.revalidate([
      'catalogues',
      `catalogue-${catalogue.slug}`,
    ]);
    return { message: 'Catalogue permanently deleted' };
  }

  // ── Catalogue services ─────────────────────────────────────
  async attachService(id: string, dto: AttachCatalogueServiceDto) {
    const catalogue = await this.getCatalogueOrThrow(id);

    const [service] = await this.drizzle.db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.id, dto.serviceId))
      .limit(1);

    if (!service) throw new NotFoundException('Service not found');

    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const [{ maxOrder }] = await this.drizzle.db
        .select({
          maxOrder: sql<number>`COALESCE(MAX(${catalogueServices.sortOrder}), -1)::int`,
        })
        .from(catalogueServices)
        .where(eq(catalogueServices.catalogueId, id));
      sortOrder = maxOrder + 1;
    }

    await this.drizzle.db
      .insert(catalogueServices)
      .values({ catalogueId: id, serviceId: dto.serviceId, sortOrder })
      .onConflictDoUpdate({
        target: [catalogueServices.catalogueId, catalogueServices.serviceId],
        set: { sortOrder },
      });

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'catalogues',
      `catalogue-${catalogue.slug}`,
    ]);
    return result;
  }

  async detachService(id: string, serviceId: string) {
    const catalogue = await this.getCatalogueOrThrow(id);

    const deleted = await this.drizzle.db
      .delete(catalogueServices)
      .where(
        and(
          eq(catalogueServices.catalogueId, id),
          eq(catalogueServices.serviceId, serviceId),
        ),
      )
      .returning();

    if (deleted.length === 0)
      throw new NotFoundException('Service is not attached to this catalogue');

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'catalogues',
      `catalogue-${catalogue.slug}`,
    ]);
    return result;
  }

  async reorderServices(id: string, dto: ReorderCatalogueServicesDto) {
    const catalogue = await this.getCatalogueOrThrow(id);

    const attached = await this.drizzle.db
      .select({ serviceId: catalogueServices.serviceId })
      .from(catalogueServices)
      .where(eq(catalogueServices.catalogueId, id));
    const attachedIds = new Set(attached.map((a) => a.serviceId));

    for (const serviceId of dto.serviceIds) {
      if (!attachedIds.has(serviceId))
        throw new BadRequestException(
          `Service ${serviceId} is not attached to this catalogue`,
        );
    }

    await this.drizzle.db.transaction(async (tx) => {
      for (let i = 0; i < dto.serviceIds.length; i++) {
        await tx
          .update(catalogueServices)
          .set({ sortOrder: i })
          .where(
            and(
              eq(catalogueServices.catalogueId, id),
              eq(catalogueServices.serviceId, dto.serviceIds[i]),
            ),
          );
      }
    });

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'catalogues',
      `catalogue-${catalogue.slug}`,
    ]);
    return result;
  }

  private async getCatalogueOrThrow(id: string) {
    const [catalogue] = await this.drizzle.db
      .select()
      .from(catalogues)
      .where(eq(catalogues.id, id))
      .limit(1);

    if (!catalogue) throw new NotFoundException('Catalogue not found');
    if (catalogue.deletedAt)
      throw new BadRequestException(
        'Cannot modify services of a deleted catalogue',
      );
    return catalogue;
  }

  private async fetchCatalogueServices(catalogueId: string) {
    const coverImg = alias(mediaFiles, 'cover_img');

    const rows = await this.drizzle.db
      .select({
        id: services.id,
        name: services.name,
        slug: services.slug,
        isActive: services.isActive,
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
      .where(eq(catalogueServices.catalogueId, catalogueId))
      .orderBy(asc(catalogueServices.sortOrder));

    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      isActive: s.isActive,
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
