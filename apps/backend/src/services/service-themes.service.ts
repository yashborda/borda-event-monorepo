import {
  BadRequestException,
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
  notInArray,
  sql,
} from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { serviceMedia } from '../database/schema/service-media.table.js';
import { serviceThemeLinks } from '../database/schema/service-theme-links.table.js';
import { serviceThemes } from '../database/schema/service-themes.table.js';
import { serviceVideos } from '../database/schema/service-videos.table.js';
import { services } from '../database/schema/services.table.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import type { CreateServiceThemeDto } from './dto/create-service-theme.dto.js';
import type { UpdateServiceThemeDto } from './dto/update-service-theme.dto.js';

@Injectable()
export class ServiceThemesService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly revalidationService: RevalidationService,
  ) {}

  async listAll(serviceId: string) {
    await this.getServiceOrThrow(serviceId);
    // Themes shown in a service are resolved through the link table, so a theme
    // shared into this service appears here too. Order by the per-service link
    // sortOrder (not the theme's own legacy column).
    const rows = await this.drizzle.db
      .select({ theme: serviceThemes, linkSort: serviceThemeLinks.sortOrder })
      .from(serviceThemeLinks)
      .innerJoin(
        serviceThemes,
        eq(serviceThemes.id, serviceThemeLinks.themeId),
      )
      .where(eq(serviceThemeLinks.serviceId, serviceId))
      .orderBy(asc(serviceThemeLinks.sortOrder), asc(serviceThemes.createdAt));
    return rows.map((r) => this.serialize(r.theme, r.linkSort));
  }

  /**
   * One page of themes WITH their media + videos, for the admin table. Media is
   * fetched only for the themes on the page (not the whole service), so a
   * service with hundreds of themes stays cheap to render.
   *
   * sortBy: 'name' (default, natural-ish via lower()) | 'price' (nulls last).
   */
  async listPaged(
    serviceId: string,
    page = 1,
    limit = 20,
    sortBy: 'name' | 'price' = 'name',
    sortDir: 'asc' | 'desc' = 'asc',
  ) {
    await this.getServiceOrThrow(serviceId);

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;
    const dir = sortDir === 'desc' ? desc : asc;

    // Price nulls always sort last regardless of direction.
    // Name sorts NATURALLY: the non-numeric prefix first (e.g. "baby-theme-"),
    // then the trailing number as an integer so 2 < 10 < 100 (not lexical
    // "10","100","11"). Falls back to the full lowered name for names without
    // a numeric suffix.
    const namePrefix = sql`lower(regexp_replace(${serviceThemes.name}, '\\d+$', ''))`;
    const nameNumber = sql`COALESCE(NULLIF((regexp_match(${serviceThemes.name}, '(\\d+)$'))[1], '')::bigint, 0)`;
    const orderBy =
      sortBy === 'price'
        ? [sql`${serviceThemes.price} IS NULL`, dir(serviceThemes.price)]
        : [dir(namePrefix), dir(nameNumber), asc(serviceThemeLinks.sortOrder)];

    // Page over the themes LINKED to this service (so shared themes are
    // included), joining the theme row in for sorting/media.
    const [rows, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({ theme: serviceThemes, linkSort: serviceThemeLinks.sortOrder })
        .from(serviceThemeLinks)
        .innerJoin(
          serviceThemes,
          eq(serviceThemes.id, serviceThemeLinks.themeId),
        )
        .where(eq(serviceThemeLinks.serviceId, serviceId))
        .orderBy(...orderBy)
        .limit(safeLimit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(serviceThemeLinks)
        .where(eq(serviceThemeLinks.serviceId, serviceId)),
    ]);

    const data = await this.attachMedia(
      rows.map((r) => r.theme),
      new Map(rows.map((r) => [r.theme.id, r.linkSort])),
    );
    return { data, total, page: safePage, limit: safeLimit };
  }

  /** Group each page-theme's media + videos onto it (page-scoped, not service-wide). */
  private async attachMedia(
    themeRows: (typeof serviceThemes.$inferSelect)[],
    linkSortByTheme?: Map<string, number>,
  ) {
    if (themeRows.length === 0) return [];
    const themeIds = themeRows.map((t) => t.id);

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
      // Every service each page-theme is linked to — drives the "Also in" badge.
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
      ...this.serialize(t, linkSortByTheme?.get(t.id)),
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

  async create(
    serviceId: string,
    dto: CreateServiceThemeDto,
    createdById?: string,
  ) {
    const service = await this.getServiceOrThrow(serviceId);

    const name = await this.nextThemeName(serviceId, service.slug);

    // Next position within THIS service comes from the link table.
    const [{ maxOrder }] = await this.drizzle.db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${serviceThemeLinks.sortOrder}), -1)::int`,
      })
      .from(serviceThemeLinks)
      .where(eq(serviceThemeLinks.serviceId, serviceId));

    const sortOrder = dto.sortOrder ?? maxOrder + 1;

    // Create the theme and link it to this service atomically. The legacy
    // serviceId/sortOrder on the theme row are kept in sync for back-compat.
    const inserted = await this.drizzle.db.transaction(async (tx) => {
      const [theme] = await tx
        .insert(serviceThemes)
        .values({
          serviceId,
          name,
          description: dto.description,
          price: dto.price,
          sortOrder,
          createdBy: createdById,
        })
        .returning();
      await tx.insert(serviceThemeLinks).values({
        serviceId,
        themeId: theme.id,
        sortOrder,
      });
      return theme;
    });

    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return this.serialize(inserted, sortOrder);
  }

  async update(serviceId: string, themeId: string, dto: UpdateServiceThemeDto) {
    const service = await this.getServiceOrThrow(serviceId);
    await this.getThemeOrThrow(serviceId, themeId);

    await this.drizzle.db
      .update(serviceThemes)
      .set({
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        updatedAt: new Date(),
      })
      .where(eq(serviceThemes.id, themeId));

    const [updated] = await this.drizzle.db
      .select()
      .from(serviceThemes)
      .where(eq(serviceThemes.id, themeId))
      .limit(1);

    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return this.serialize(updated);
  }

  /**
   * Remove a theme FROM this service. Because themes are shared, this unlinks
   * the theme from the service; only when it was the theme's LAST remaining
   * service do we hard-delete the theme itself (and, via ON DELETE cascade, its
   * media/video junction rows). The R2 objects are untouched — they're cleaned
   * up by the per-media/video delete endpoints.
   */
  async remove(serviceId: string, themeId: string) {
    const service = await this.getServiceOrThrow(serviceId);
    await this.getThemeOrThrow(serviceId, themeId);

    await this.unlinkAndMaybeDelete(serviceId, [themeId]);

    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return { message: 'Theme removed from service' };
  }

  /**
   * Link an EXISTING theme (from another service) into this service, so the
   * same theme — with its shared photos/videos — appears here too. No media is
   * copied. Rejects if the theme is already linked here.
   */
  async linkExisting(serviceId: string, themeId: string) {
    const service = await this.getServiceOrThrow(serviceId);

    const [theme] = await this.drizzle.db
      .select({ id: serviceThemes.id })
      .from(serviceThemes)
      .where(eq(serviceThemes.id, themeId))
      .limit(1);
    if (!theme) throw new NotFoundException('Theme not found');

    const [existing] = await this.drizzle.db
      .select({ themeId: serviceThemeLinks.themeId })
      .from(serviceThemeLinks)
      .where(
        and(
          eq(serviceThemeLinks.serviceId, serviceId),
          eq(serviceThemeLinks.themeId, themeId),
        ),
      )
      .limit(1);
    if (existing)
      throw new BadRequestException(
        'Theme is already added to this service',
      );

    const [{ maxOrder }] = await this.drizzle.db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${serviceThemeLinks.sortOrder}), -1)::int`,
      })
      .from(serviceThemeLinks)
      .where(eq(serviceThemeLinks.serviceId, serviceId));

    await this.drizzle.db
      .insert(serviceThemeLinks)
      .values({ serviceId, themeId, sortOrder: maxOrder + 1 });

    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return { message: 'Theme added to service' };
  }

  /**
   * Themes that exist (in any OTHER service) but are NOT yet linked to this
   * service — the candidate list for an "add existing theme" picker. Optional
   * case-insensitive name search. Capped to keep the payload small.
   */
  async listAvailable(serviceId: string, search?: string, limit = 50) {
    await this.getServiceOrThrow(serviceId);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const linkedHere = this.drizzle.db
      .select({ themeId: serviceThemeLinks.themeId })
      .from(serviceThemeLinks)
      .where(eq(serviceThemeLinks.serviceId, serviceId));

    const where = search
      ? and(
          notInArray(serviceThemes.id, linkedHere),
          ilike(serviceThemes.name, `%${search}%`),
        )
      : notInArray(serviceThemes.id, linkedHere);

    const rows = await this.drizzle.db
      .select()
      .from(serviceThemes)
      .where(where)
      .orderBy(asc(serviceThemes.name))
      .limit(safeLimit);

    const themes = await this.attachMedia(rows);
    return themes;
  }

  /** Which services a theme is currently linked to — for an "Also in …" badge. */
  async listServicesForTheme(themeId: string) {
    const rows = await this.drizzle.db
      .select({ id: services.id, name: services.name, slug: services.slug })
      .from(serviceThemeLinks)
      .innerJoin(services, eq(services.id, serviceThemeLinks.serviceId))
      .where(eq(serviceThemeLinks.themeId, themeId))
      .orderBy(asc(services.name));
    return rows;
  }

  /**
   * Unlink the given themes from a service, then hard-delete any of them that no
   * longer belong to ANY service. Runs in a single transaction.
   */
  private async unlinkAndMaybeDelete(serviceId: string, themeIds: string[]) {
    if (themeIds.length === 0) return;
    await this.drizzle.db.transaction(async (tx) => {
      await tx
        .delete(serviceThemeLinks)
        .where(
          and(
            eq(serviceThemeLinks.serviceId, serviceId),
            inArray(serviceThemeLinks.themeId, themeIds),
          ),
        );

      // Of the just-unlinked themes, find which are now orphaned (no links left)
      // and delete them outright.
      const stillLinked = await tx
        .select({ themeId: serviceThemeLinks.themeId })
        .from(serviceThemeLinks)
        .where(inArray(serviceThemeLinks.themeId, themeIds));
      const linkedSet = new Set(stillLinked.map((r) => r.themeId));
      const orphaned = themeIds.filter((id) => !linkedSet.has(id));
      if (orphaned.length > 0) {
        await tx
          .delete(serviceThemes)
          .where(inArray(serviceThemes.id, orphaned));
      }
    });
  }

  /**
   * Delete multiple themes at once. Every id must belong to this service or the
   * whole call is rejected (no partial deletes). Attached media/videos unlink
   * via ON DELETE cascade, same as single remove. Returns the deleted count.
   */
  async bulkRemove(serviceId: string, themeIds: string[]) {
    const service = await this.getServiceOrThrow(serviceId);

    const ids = Array.from(new Set(themeIds));
    const owned = await this.drizzle.db
      .select({ id: serviceThemeLinks.themeId })
      .from(serviceThemeLinks)
      .where(
        and(
          eq(serviceThemeLinks.serviceId, serviceId),
          inArray(serviceThemeLinks.themeId, ids),
        ),
      );

    if (owned.length !== ids.length)
      throw new BadRequestException(
        'One or more themes do not belong to this service',
      );

    await this.unlinkAndMaybeDelete(serviceId, ids);

    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return { message: `${ids.length} theme(s) removed`, count: ids.length };
  }

  async reorder(serviceId: string, themeIds: string[]) {
    const service = await this.getServiceOrThrow(serviceId);

    const owned = await this.drizzle.db
      .select({ id: serviceThemeLinks.themeId })
      .from(serviceThemeLinks)
      .where(eq(serviceThemeLinks.serviceId, serviceId));
    const ownedIds = new Set(owned.map((o) => o.id));

    for (const id of themeIds) {
      if (!ownedIds.has(id))
        throw new BadRequestException(
          `Theme ${id} does not belong to this service`,
        );
    }

    // Reorder is per-service: only this service's link rows are renumbered, so
    // a shared theme's position in OTHER services is unaffected.
    await this.drizzle.db.transaction(async (tx) => {
      for (let i = 0; i < themeIds.length; i++) {
        await tx
          .update(serviceThemeLinks)
          .set({ sortOrder: i })
          .where(
            and(
              eq(serviceThemeLinks.serviceId, serviceId),
              eq(serviceThemeLinks.themeId, themeIds[i]),
            ),
          );
      }
    });

    this.revalidationService.revalidate([
      'services',
      `service-${service.slug}`,
    ]);
    return this.listAll(serviceId);
  }

  /**
   * Generate the next system theme name: `<first-word-of-slug>-theme-NN` where
   * NN is the smallest unused two-digit (zero-padded) suffix among existing
   * themes for this service. Slug `baby-shower` → `baby-theme-01`. Slug
   * `engagement` → `engagement-theme-01`. NN wraps to 3 digits if it ever
   * exceeds 99.
   */
  private async nextThemeName(
    serviceId: string,
    serviceSlug: string,
  ): Promise<string> {
    const prefix = (serviceSlug.split('-')[0] || 'theme').toLowerCase();
    const namePrefix = `${prefix}-theme-`;

    const existing = await this.drizzle.db
      .select({ name: serviceThemes.name })
      .from(serviceThemes)
      .where(eq(serviceThemes.serviceId, serviceId));

    const used = new Set<number>();
    for (const { name } of existing) {
      if (!name.startsWith(namePrefix)) continue;
      const suffix = name.slice(namePrefix.length);
      const n = parseInt(suffix, 10);
      if (Number.isFinite(n)) used.add(n);
    }

    let next = 1;
    while (used.has(next)) next++;
    const pad = next < 100 ? String(next).padStart(2, '0') : String(next);
    return `${namePrefix}${pad}`;
  }

  /**
   * Default number of empty placeholder themes a service starts with — created
   * on service creation and topped up by the themes seeder.
   */
  static readonly DEFAULT_THEME_COUNT = 100;

  /**
   * Bulk-create empty (name-only) themes so the service has up to `target`
   * total. Names follow the same `<prefix>-theme-NN` convention as the manual
   * "Add Theme" flow, filling the smallest unused suffixes. Idempotent: if the
   * service already has >= target themes, nothing happens. Returns how many
   * were created. Accepts an optional executor (`tx`) to run inside a caller's
   * transaction.
   */
  async createDefaultThemes(
    serviceId: string,
    serviceSlug: string,
    target = ServiceThemesService.DEFAULT_THEME_COUNT,
    createdById?: string,
    executor: Pick<typeof this.drizzle.db, 'select' | 'insert'> = this.drizzle
      .db,
  ): Promise<number> {
    const prefix = (serviceSlug.split('-')[0] || 'theme').toLowerCase();
    const namePrefix = `${prefix}-theme-`;

    const existing = await executor
      .select({ name: serviceThemes.name, sortOrder: serviceThemes.sortOrder })
      .from(serviceThemes)
      .where(eq(serviceThemes.serviceId, serviceId));

    if (existing.length >= target) return 0;

    const used = new Set<number>();
    let maxOrder = -1;
    for (const { name, sortOrder } of existing) {
      if (sortOrder > maxOrder) maxOrder = sortOrder;
      if (!name.startsWith(namePrefix)) continue;
      const n = parseInt(name.slice(namePrefix.length), 10);
      if (Number.isFinite(n)) used.add(n);
    }

    const toCreate = target - existing.length;
    const values: (typeof serviceThemes.$inferInsert)[] = [];
    let next = 1;
    for (let i = 0; i < toCreate; i++) {
      while (used.has(next)) next++;
      used.add(next);
      const pad = next < 100 ? String(next).padStart(2, '0') : String(next);
      values.push({
        serviceId,
        name: `${namePrefix}${pad}`,
        sortOrder: ++maxOrder,
        createdBy: createdById,
      });
    }

    const inserted = await executor
      .insert(serviceThemes)
      .values(values)
      .returning({ id: serviceThemes.id, sortOrder: serviceThemes.sortOrder });

    // Link each placeholder theme to the service so it surfaces in the
    // link-table-driven theme lists.
    await executor.insert(serviceThemeLinks).values(
      inserted.map((t) => ({
        serviceId,
        themeId: t.id,
        sortOrder: t.sortOrder,
      })),
    );
    return values.length;
  }

  /**
   * `linkSortOrder`, when provided, is the per-service ordering from
   * service_theme_links and takes precedence over the theme's own legacy
   * sortOrder column — so a shared theme can sit in a different position in
   * each service it belongs to.
   */
  private serialize(
    t: typeof serviceThemes.$inferSelect,
    linkSortOrder?: number,
  ) {
    return {
      id: t.id,
      serviceId: t.serviceId,
      name: t.name,
      description: t.description,
      price: t.price,
      sortOrder: linkSortOrder ?? t.sortOrder,
      createdBy: t.createdBy,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
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
        'Cannot modify themes of a deleted service',
      );
    return service;
  }

  /** A theme belongs to a service when a link row joins them. */
  private async getThemeOrThrow(serviceId: string, themeId: string) {
    const [row] = await this.drizzle.db
      .select({ theme: serviceThemes })
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
    if (!row) throw new NotFoundException('Theme not found');
    return row.theme;
  }
}
