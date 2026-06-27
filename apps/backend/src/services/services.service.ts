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
  inArray,
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
import { serviceThemeLinks } from '../database/schema/service-theme-links.table.js';
import { serviceThemes } from '../database/schema/service-themes.table.js';
import { serviceVideos } from '../database/schema/service-videos.table.js';
import { services } from '../database/schema/services.table.js';
import { generateSlug } from '../common/utils/slug.util.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadService } from '../upload/upload.service.js';
import { R2Service } from '../upload/r2.service.js';
import { ServiceThemesService } from './service-themes.service.js';
import type { CreateServiceDto } from './dto/create-service.dto.js';
import type { UpdateServiceDto } from './dto/update-service.dto.js';
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
    private readonly r2Service: R2Service,
    private readonly serviceThemesService: ServiceThemesService,
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
    const bannerImg = alias(mediaFiles, 'banner_img');

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
        bannerImageId: bannerImg.id,
        bannerImageUrl: bannerImg.url,
        bannerImageFolder: bannerImg.folder,
        bannerImageOriginalName: bannerImg.originalName,
        bannerImageMimeType: bannerImg.mimeType,
        bannerImageSize: bannerImg.size,
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
      .leftJoin(bannerImg, eq(services.bannerImageId, bannerImg.id))
      .where(eq(services.id, id))
      .limit(1);

    if (!s) throw new NotFoundException('Service not found');

    const [media, themes] = await Promise.all([
      this.fetchServiceMedia(id),
      this.fetchServiceThemes(id),
    ]);

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
      bannerImage: mediaObject({
        id: s.bannerImageId,
        url: s.bannerImageUrl,
        folder: s.bannerImageFolder,
        originalName: s.bannerImageOriginalName,
        mimeType: s.bannerImageMimeType,
        size: s.bannerImageSize,
      }),
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
      themes,
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
        bannerImageId: dto.bannerImageId,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        createdBy: createdById,
      })
      .returning();

    // Every new service starts with a full set of empty placeholder themes
    // (baby-theme-01 … baby-theme-100) the admin can fill in later.
    await this.serviceThemesService.createDefaultThemes(
      service.id,
      service.slug,
      ServiceThemesService.DEFAULT_THEME_COUNT,
      createdById,
    );

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
      // r2Service.deleteFile drops the R2 object (if any) + the media_files
      // row; safe to call for both R2-backed and legacy local media.
      await this.r2Service.deleteFile(existing.coverImageId);
    }

    // Same cleanup for the banner image when it's being replaced/cleared.
    if (
      dto.bannerImageId !== undefined &&
      dto.bannerImageId !== existing.bannerImageId &&
      existing.bannerImageId
    ) {
      await this.r2Service.deleteFile(existing.bannerImageId);
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
        ...(dto.bannerImageId !== undefined && {
          bannerImageId: dto.bannerImageId,
        }),
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
      await this.r2Service.deleteFile(service.coverImageId);
    }
    if (service.bannerImageId) {
      await this.r2Service.deleteFile(service.bannerImageId);
    }

    this.revalidationService.revalidate(['services', `service-${service.slug}`]);
    return { message: 'Service permanently deleted' };
  }

  // ── Service media ──────────────────────────────────────────
  async attachMedia(
    id: string,
    file: Express.Multer.File,
    themeId?: string,
  ) {
    const service = await this.getServiceOrThrow(id);

    // For theme media, derive a readable R2 key prefix `th-<themeNum>` and the
    // next sequence number so files land as e.g. baby-shower/th-01-03.jpg.
    let nameOpts: { namePrefix: string; startSeq: number } | undefined;
    if (themeId) {
      const theme = await this.assertThemeBelongsToService(id, themeId);
      const themeNum = this.themeNumber(theme.name);
      const [{ count: mediaCount }] = await this.drizzle.db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(serviceMedia)
        .where(
          and(
            eq(serviceMedia.serviceId, id),
            eq(serviceMedia.themeId, themeId),
          ),
        );
      nameOpts = { namePrefix: `th-${themeNum}`, startSeq: mediaCount + 1 };
    }

    // Upload to R2 (subfolder = service name); this inserts the media_files
    // row (with the R2 object key in drive_file_id + url) and returns it.
    const media = await this.r2Service.uploadImage(
      file,
      service.name,
      nameOpts,
    );

    const [{ maxOrder }] = await this.drizzle.db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${serviceMedia.sortOrder}), -1)::int`,
      })
      .from(serviceMedia)
      .where(eq(serviceMedia.serviceId, id));

    // First photo uploaded to a theme is automatically the featured one.
    let isFeatured = false;
    if (themeId) {
      const existingFeatured = await this.drizzle.db
        .select({ mediaId: serviceMedia.mediaId })
        .from(serviceMedia)
        .where(
          and(
            eq(serviceMedia.themeId, themeId),
            eq(serviceMedia.isFeatured, true),
          ),
        )
        .limit(1);
      if (existingFeatured.length === 0) isFeatured = true;
    }

    await this.drizzle.db.insert(serviceMedia).values({
      serviceId: id,
      mediaId: media.id,
      themeId: themeId ?? null,
      isFeatured,
      sortOrder: maxOrder + 1,
    });

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return result;
  }

  /**
   * Mark a media row as featured for its theme. Transactionally unsets any
   * existing featured row in the same theme, then sets the chosen one. The
   * media must belong to this service AND be attached to a theme (service-level
   * media has no concept of "featured" — that's a per-theme decision).
   */
  async setMediaFeatured(serviceId: string, mediaId: string) {
    const service = await this.getServiceOrThrow(serviceId);

    const [row] = await this.drizzle.db
      .select({ themeId: serviceMedia.themeId })
      .from(serviceMedia)
      .where(
        and(
          eq(serviceMedia.serviceId, serviceId),
          eq(serviceMedia.mediaId, mediaId),
        ),
      )
      .limit(1);
    if (!row) throw new NotFoundException('Media not attached to this service');
    if (!row.themeId)
      throw new BadRequestException(
        'Only media attached to a theme can be featured',
      );

    await this.drizzle.db.transaction(async (tx) => {
      await tx
        .update(serviceMedia)
        .set({ isFeatured: false })
        .where(
          and(
            eq(serviceMedia.themeId, row.themeId!),
            eq(serviceMedia.isFeatured, true),
          ),
        );
      await tx
        .update(serviceMedia)
        .set({ isFeatured: true })
        .where(
          and(
            eq(serviceMedia.serviceId, serviceId),
            eq(serviceMedia.mediaId, mediaId),
          ),
        );
    });

    const result = await this.findOne(serviceId);
    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return result;
  }

  private async assertThemeBelongsToService(
    serviceId: string,
    themeId: string,
  ) {
    // Membership is via the link table now (themes are shared), so a theme
    // linked into this service passes even if it originated elsewhere.
    const [t] = await this.drizzle.db
      .select({ id: serviceThemes.id, name: serviceThemes.name })
      .from(serviceThemeLinks)
      .innerJoin(
        serviceThemes,
        eq(serviceThemes.id, serviceThemeLinks.themeId),
      )
      .where(
        and(
          eq(serviceThemeLinks.themeId, themeId),
          eq(serviceThemeLinks.serviceId, serviceId),
        ),
      )
      .limit(1);
    if (!t) throw new BadRequestException('Theme does not belong to this service');
    return t;
  }

  /**
   * Pull the numeric suffix out of a theme name like `baby-theme-07` → `07`.
   * Falls back to `01` if the name has no trailing number. Always 2+ digits,
   * zero-padded, so R2 keys sort/group naturally (th-01, th-02 … th-100).
   */
  private themeNumber(themeName: string): string {
    const m = themeName.match(/(\d+)\s*$/);
    const n = m ? parseInt(m[1], 10) : 1;
    return n < 100 ? String(n).padStart(2, '0') : String(n);
  }

  /**
   * Rename a photo attached to a service: updates media_files.original_name.
   * R2 objects are immutable (renaming would change the public URL), so the
   * stored file is left untouched — only the display name changes.
   */
  async renameMedia(serviceId: string, mediaId: string, newName: string) {
    const service = await this.getServiceOrThrow(serviceId);

    const [attached] = await this.drizzle.db
      .select({ mediaId: serviceMedia.mediaId })
      .from(serviceMedia)
      .where(
        and(
          eq(serviceMedia.serviceId, serviceId),
          eq(serviceMedia.mediaId, mediaId),
        ),
      )
      .limit(1);
    if (!attached)
      throw new NotFoundException('Media is not attached to this service');

    const [mediaRow] = await this.drizzle.db
      .select({
        id: mediaFiles.id,
        driveFileId: mediaFiles.driveFileId,
      })
      .from(mediaFiles)
      .where(eq(mediaFiles.id, mediaId))
      .limit(1);
    if (!mediaRow) throw new NotFoundException('Media file not found');

    const trimmed = newName.trim();
    if (!trimmed) throw new BadRequestException('Name cannot be empty');

    if (mediaRow.driveFileId) {
      await this.r2Service.renameFile(mediaRow.driveFileId, trimmed);
    }

    await this.drizzle.db
      .update(mediaFiles)
      .set({ originalName: trimmed })
      .where(eq(mediaFiles.id, mediaId));

    const result = await this.findOne(serviceId);
    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return result;
  }

  async detachMedia(id: string, mediaId: string) {
    const service = await this.getServiceOrThrow(id);

    // Look the media up by its id alone. A theme-attached photo may have been
    // uploaded from another service (themes are shared), so its junction row's
    // serviceId can differ from the one we're viewing from — keying on
    // serviceId would wrongly 404 it.
    const [attached] = await this.drizzle.db
      .select({
        mediaId: serviceMedia.mediaId,
        themeId: serviceMedia.themeId,
        isFeatured: serviceMedia.isFeatured,
      })
      .from(serviceMedia)
      .where(eq(serviceMedia.mediaId, mediaId))
      .limit(1);

    if (!attached)
      throw new NotFoundException('Media is not attached to this service');

    // Deletes the R2 object (by drive_file_id) + the media_files row; the
    // service_media junction is removed via ON DELETE cascade.
    await this.r2Service.deleteFile(mediaId);

    // If we just deleted the featured photo for a theme, auto-promote the next
    // remaining photo in that theme by sortOrder. The user's expectation:
    // "if one, by default first is feature".
    if (attached.isFeatured && attached.themeId) {
      const [next] = await this.drizzle.db
        .select({ mediaId: serviceMedia.mediaId })
        .from(serviceMedia)
        .where(eq(serviceMedia.themeId, attached.themeId))
        .orderBy(asc(serviceMedia.sortOrder))
        .limit(1);
      if (next) {
        await this.drizzle.db
          .update(serviceMedia)
          .set({ isFeatured: true })
          .where(
            and(
              eq(serviceMedia.themeId, attached.themeId),
              eq(serviceMedia.mediaId, next.mediaId),
            ),
          );
      }
    }

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

  /**
   * Top-level (service-level) media only — rows with NO theme. Theme-attached
   * media now comes through `fetchServiceThemes` (keyed by themeId so shared
   * themes carry their media everywhere), so including it here too would
   * double-list it.
   */
  private async fetchServiceMedia(serviceId: string) {
    const rows = await this.drizzle.db
      .select({
        id: mediaFiles.id,
        url: mediaFiles.url,
        folder: mediaFiles.folder,
        originalName: mediaFiles.originalName,
        mimeType: mediaFiles.mimeType,
        size: mediaFiles.size,
        themeId: serviceMedia.themeId,
        isFeatured: serviceMedia.isFeatured,
        sortOrder: serviceMedia.sortOrder,
      })
      .from(serviceMedia)
      .innerJoin(mediaFiles, eq(serviceMedia.mediaId, mediaFiles.id))
      .where(
        and(
          eq(serviceMedia.serviceId, serviceId),
          isNull(serviceMedia.themeId),
        ),
      )
      .orderBy(asc(serviceMedia.sortOrder));

    return rows.map((m) => ({
      id: m.id,
      url: m.url,
      folder: m.folder,
      originalName: m.originalName,
      mimeType: m.mimeType,
      size: m.size,
      themeId: m.themeId,
      isFeatured: m.isFeatured,
      sortOrder: m.sortOrder,
    }));
  }

  /**
   * Returns each theme with its grouped photos + videos (drive-hosted or
   * instagram-linked) so the admin edit page can render per-theme galleries
   * without an extra round-trip. Service-level (themeId === null) media and
   * videos stay on the top-level `media` array returned by `findOne`.
   */
  private async fetchServiceThemes(serviceId: string) {
    // Themes are resolved through the link table so a theme shared into this
    // service is included; ordering is the per-service link sortOrder.
    const themeRowsRaw = await this.drizzle.db
      .select({ theme: serviceThemes, linkSort: serviceThemeLinks.sortOrder })
      .from(serviceThemeLinks)
      .innerJoin(
        serviceThemes,
        eq(serviceThemes.id, serviceThemeLinks.themeId),
      )
      .where(eq(serviceThemeLinks.serviceId, serviceId))
      .orderBy(asc(serviceThemeLinks.sortOrder), asc(serviceThemes.createdAt));

    if (themeRowsRaw.length === 0) return [];

    const themeRows = themeRowsRaw.map((r) => r.theme);
    const linkSortByTheme = new Map(
      themeRowsRaw.map((r) => [r.theme.id, r.linkSort]),
    );
    const themeIds = themeRows.map((t) => t.id);

    // Media/videos are fetched BY themeId (not serviceId), so a shared theme's
    // photos/videos surface in every service it's linked to.
    const [mediaRows, videoRows, linkRows] = await Promise.all([
      this.drizzle.db
        .select({
          themeId: serviceMedia.themeId,
          id: mediaFiles.id,
          url: mediaFiles.url,
          folder: mediaFiles.folder,
          originalName: mediaFiles.originalName,
          mimeType: mediaFiles.mimeType,
          size: mediaFiles.size,
          isFeatured: serviceMedia.isFeatured,
          sortOrder: serviceMedia.sortOrder,
        })
        .from(serviceMedia)
        .innerJoin(mediaFiles, eq(serviceMedia.mediaId, mediaFiles.id))
        .where(inArray(serviceMedia.themeId, themeIds))
        .orderBy(asc(serviceMedia.sortOrder)),
      this.drizzle.db
        .select({
          themeId: serviceVideos.themeId,
          id: serviceVideos.id,
          type: serviceVideos.type,
          title: serviceVideos.title,
          instagramUrl: serviceVideos.instagramUrl,
          driveFileId: serviceVideos.driveFileId,
          driveUrl: serviceVideos.driveUrl,
          isFeatured: serviceVideos.isFeatured,
          sortOrder: serviceVideos.sortOrder,
        })
        .from(serviceVideos)
        .where(inArray(serviceVideos.themeId, themeIds))
        .orderBy(asc(serviceVideos.sortOrder)),
      // Every service each theme is linked to — for the admin "Shared with"
      // section / "Also in" badge.
      this.drizzle.db
        .select({
          themeId: serviceThemeLinks.themeId,
          id: services.id,
          name: services.name,
          slug: services.slug,
        })
        .from(serviceThemeLinks)
        .innerJoin(services, eq(services.id, serviceThemeLinks.serviceId))
        .where(inArray(serviceThemeLinks.themeId, themeIds))
        .orderBy(asc(services.name)),
    ]);

    const servicesByTheme = new Map<string, typeof linkRows>();
    for (const l of linkRows) {
      const arr = servicesByTheme.get(l.themeId) ?? [];
      arr.push(l);
      servicesByTheme.set(l.themeId, arr);
    }

    const mediaByTheme = new Map<string, typeof mediaRows>();
    for (const m of mediaRows) {
      if (!m.themeId) continue;
      const arr = mediaByTheme.get(m.themeId) ?? [];
      arr.push(m);
      mediaByTheme.set(m.themeId, arr);
    }

    const videosByTheme = new Map<string, typeof videoRows>();
    for (const v of videoRows) {
      if (!v.themeId) continue;
      const arr = videosByTheme.get(v.themeId) ?? [];
      arr.push(v);
      videosByTheme.set(v.themeId, arr);
    }

    return themeRows.map((t) => ({
      id: t.id,
      serviceId: t.serviceId,
      name: t.name,
      description: t.description,
      price: t.price,
      sortOrder: linkSortByTheme.get(t.id) ?? t.sortOrder,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      linkedServices: (servicesByTheme.get(t.id) ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
      })),
      media: (mediaByTheme.get(t.id) ?? []).map((m) => ({
        id: m.id,
        url: m.url,
        folder: m.folder,
        originalName: m.originalName,
        mimeType: m.mimeType,
        size: m.size,
        isFeatured: m.isFeatured,
        sortOrder: m.sortOrder,
      })),
      videos: (videosByTheme.get(t.id) ?? []).map((v) => ({
        id: v.id,
        type: v.type,
        title: v.title,
        instagramUrl: v.instagramUrl,
        driveFileId: v.driveFileId,
        driveUrl: v.driveUrl,
        isFeatured: v.isFeatured,
        sortOrder: v.sortOrder,
      })),
    }));
  }
}
