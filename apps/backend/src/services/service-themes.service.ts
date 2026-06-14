import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, sql } from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { serviceThemes } from '../database/schema/service-themes.table.js';
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
    const rows = await this.drizzle.db
      .select()
      .from(serviceThemes)
      .where(eq(serviceThemes.serviceId, serviceId))
      .orderBy(asc(serviceThemes.sortOrder), asc(serviceThemes.createdAt));
    return rows.map((t) => this.serialize(t));
  }

  async create(
    serviceId: string,
    dto: CreateServiceThemeDto,
    createdById?: string,
  ) {
    const service = await this.getServiceOrThrow(serviceId);

    const name = await this.nextThemeName(serviceId, service.slug);

    const [{ maxOrder }] = await this.drizzle.db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${serviceThemes.sortOrder}), -1)::int`,
      })
      .from(serviceThemes)
      .where(eq(serviceThemes.serviceId, serviceId));

    const [inserted] = await this.drizzle.db
      .insert(serviceThemes)
      .values({
        serviceId,
        name,
        description: dto.description,
        price: dto.price,
        sortOrder: dto.sortOrder ?? maxOrder + 1,
        createdBy: createdById,
      })
      .returning();

    this.revalidationService.revalidate(['services', `service-${service.slug}`]);
    return this.serialize(inserted);
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

    this.revalidationService.revalidate(['services', `service-${service.slug}`]);
    return this.serialize(updated);
  }

  async remove(serviceId: string, themeId: string) {
    const service = await this.getServiceOrThrow(serviceId);
    await this.getThemeOrThrow(serviceId, themeId);

    // ON DELETE cascade on service_media.theme_id + service_videos.theme_id
    // unlinks attached media/videos automatically (sets row to deleted because
    // the FK is also CASCADE). Drive files themselves stay — they're cleaned up
    // by the per-media / per-video delete endpoints, not theme removal.
    await this.drizzle.db
      .delete(serviceThemes)
      .where(eq(serviceThemes.id, themeId));

    this.revalidationService.revalidate(['services', `service-${service.slug}`]);
    return { message: 'Theme deleted' };
  }

  async reorder(serviceId: string, themeIds: string[]) {
    const service = await this.getServiceOrThrow(serviceId);

    const owned = await this.drizzle.db
      .select({ id: serviceThemes.id })
      .from(serviceThemes)
      .where(eq(serviceThemes.serviceId, serviceId));
    const ownedIds = new Set(owned.map((o) => o.id));

    for (const id of themeIds) {
      if (!ownedIds.has(id))
        throw new BadRequestException(
          `Theme ${id} does not belong to this service`,
        );
    }

    await this.drizzle.db.transaction(async (tx) => {
      for (let i = 0; i < themeIds.length; i++) {
        await tx
          .update(serviceThemes)
          .set({ sortOrder: i })
          .where(eq(serviceThemes.id, themeIds[i]));
      }
    });

    this.revalidationService.revalidate(['services', `service-${service.slug}`]);
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

  private serialize(t: typeof serviceThemes.$inferSelect) {
    return {
      id: t.id,
      serviceId: t.serviceId,
      name: t.name,
      description: t.description,
      price: t.price,
      sortOrder: t.sortOrder,
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

  private async getThemeOrThrow(serviceId: string, themeId: string) {
    const [theme] = await this.drizzle.db
      .select()
      .from(serviceThemes)
      .where(
        and(
          eq(serviceThemes.id, themeId),
          eq(serviceThemes.serviceId, serviceId),
        ),
      )
      .limit(1);
    if (!theme) throw new NotFoundException('Theme not found');
    return theme;
  }
}
