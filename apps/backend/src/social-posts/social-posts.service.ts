import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { adminUsers } from '../database/schema/admin-users.table.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { socialPosts } from '../database/schema/social-posts.table.js';
import { socialPlatformEnum } from '../database/schema/event-enums.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadService } from '../upload/upload.service.js';
import type { CreateSocialPostDto } from './dto/create-social-post.dto.js';
import type { UpdateSocialPostDto } from './dto/update-social-post.dto.js';
import type { ReorderSocialPostsDto } from './dto/reorder-social-posts.dto.js';

type SocialPlatform = (typeof socialPlatformEnum.enumValues)[number];

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
export class SocialPostsService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly revalidationService: RevalidationService,
    private readonly uploadService: UploadService,
  ) {}

  async listAll(
    page = 1,
    limit = 20,
    platform?: string,
    isFeatured?: boolean,
    sortBy = 'sortOrder',
    sortDir: 'asc' | 'desc' = 'asc',
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'platform'
        ? socialPosts.platform
        : sortBy === 'isFeatured'
          ? socialPosts.isFeatured
          : sortBy === 'createdAt'
            ? socialPosts.createdAt
            : sortBy === 'updatedAt'
              ? socialPosts.updatedAt
              : socialPosts.sortOrder;

    const orderExpr = sortDir === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const conditions = [];

    if (
      platform &&
      (socialPlatformEnum.enumValues as readonly string[]).includes(platform)
    ) {
      conditions.push(eq(socialPosts.platform, platform as SocialPlatform));
    }

    if (isFeatured !== undefined) {
      conditions.push(eq(socialPosts.isFeatured, isFeatured));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const thumb = alias(mediaFiles, 'thumb');
    const createdByUser = alias(adminUsers, 'created_by_user');

    const [rows, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: socialPosts.id,
          platform: socialPosts.platform,
          postUrl: socialPosts.postUrl,
          caption: socialPosts.caption,
          isFeatured: socialPosts.isFeatured,
          sortOrder: socialPosts.sortOrder,
          thumbnailId: thumb.id,
          thumbnailUrl: thumb.url,
          thumbnailFolder: thumb.folder,
          thumbnailOriginalName: thumb.originalName,
          thumbnailMimeType: thumb.mimeType,
          thumbnailSize: thumb.size,
          createdBy: socialPosts.createdBy,
          createdByName: createdByUser.fullName,
          createdAt: socialPosts.createdAt,
          updatedAt: socialPosts.updatedAt,
        })
        .from(socialPosts)
        .leftJoin(thumb, eq(socialPosts.thumbnailId, thumb.id))
        .leftJoin(createdByUser, eq(socialPosts.createdBy, createdByUser.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(socialPosts)
        .where(whereClause),
    ]);

    return {
      data: rows.map((p) => this.toDto(p)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const thumb = alias(mediaFiles, 'thumb');
    const createdByUser = alias(adminUsers, 'created_by_user');

    const [p] = await this.drizzle.db
      .select({
        id: socialPosts.id,
        platform: socialPosts.platform,
        postUrl: socialPosts.postUrl,
        caption: socialPosts.caption,
        isFeatured: socialPosts.isFeatured,
        sortOrder: socialPosts.sortOrder,
        thumbnailId: thumb.id,
        thumbnailUrl: thumb.url,
        thumbnailFolder: thumb.folder,
        thumbnailOriginalName: thumb.originalName,
        thumbnailMimeType: thumb.mimeType,
        thumbnailSize: thumb.size,
        createdBy: socialPosts.createdBy,
        createdByName: createdByUser.fullName,
        createdAt: socialPosts.createdAt,
        updatedAt: socialPosts.updatedAt,
      })
      .from(socialPosts)
      .leftJoin(thumb, eq(socialPosts.thumbnailId, thumb.id))
      .leftJoin(createdByUser, eq(socialPosts.createdBy, createdByUser.id))
      .where(eq(socialPosts.id, id))
      .limit(1);

    if (!p) throw new NotFoundException('Social post not found');
    return this.toDto(p);
  }

  async create(dto: CreateSocialPostDto, createdById?: string) {
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const [{ maxOrder }] = await this.drizzle.db
        .select({
          maxOrder: sql<number>`COALESCE(MAX(${socialPosts.sortOrder}), -1)::int`,
        })
        .from(socialPosts);
      sortOrder = maxOrder + 1;
    }

    const [post] = await this.drizzle.db
      .insert(socialPosts)
      .values({
        platform: dto.platform,
        postUrl: dto.postUrl,
        thumbnailId: dto.thumbnailId,
        caption: dto.caption,
        isFeatured: dto.isFeatured ?? false,
        sortOrder,
        createdBy: createdById,
      })
      .returning({ id: socialPosts.id });

    const result = await this.findOne(post.id);
    this.revalidationService.revalidate(['social-posts']);
    return result;
  }

  async update(id: string, dto: UpdateSocialPostDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Social post not found');

    if (
      dto.thumbnailId !== undefined &&
      dto.thumbnailId !== existing.thumbnailId &&
      existing.thumbnailId
    ) {
      await this.uploadService.deleteFile(existing.thumbnailId);
    }

    await this.drizzle.db
      .update(socialPosts)
      .set({
        ...(dto.platform !== undefined && { platform: dto.platform }),
        ...(dto.postUrl !== undefined && { postUrl: dto.postUrl }),
        ...(dto.thumbnailId !== undefined && { thumbnailId: dto.thumbnailId }),
        ...(dto.caption !== undefined && { caption: dto.caption }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        updatedAt: new Date(),
      })
      .where(eq(socialPosts.id, id));

    const result = await this.findOne(id);
    this.revalidationService.revalidate(['social-posts']);
    return result;
  }

  async reorder(dto: ReorderSocialPostsDto) {
    const existing = await this.drizzle.db
      .select({ id: socialPosts.id })
      .from(socialPosts)
      .where(inArray(socialPosts.id, dto.ids));
    const existingIds = new Set(existing.map((e) => e.id));

    for (const id of dto.ids) {
      if (!existingIds.has(id))
        throw new BadRequestException(`Social post ${id} not found`);
    }

    await this.drizzle.db.transaction(async (tx) => {
      for (let i = 0; i < dto.ids.length; i++) {
        await tx
          .update(socialPosts)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(socialPosts.id, dto.ids[i]));
      }
    });

    this.revalidationService.revalidate(['social-posts']);
    return this.listAll(1, dto.ids.length);
  }

  async remove(id: string) {
    const [post] = await this.drizzle.db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.id, id))
      .limit(1);

    if (!post) throw new NotFoundException('Social post not found');

    await this.drizzle.db.delete(socialPosts).where(eq(socialPosts.id, id));

    if (post.thumbnailId) {
      await this.uploadService.deleteFile(post.thumbnailId);
    }

    this.revalidationService.revalidate(['social-posts']);
    return { message: 'Social post deleted' };
  }

  private toDto(p: {
    id: string;
    platform: SocialPlatform;
    postUrl: string;
    caption: string | null;
    isFeatured: boolean;
    sortOrder: number;
    thumbnailId: string | null;
    thumbnailUrl: string | null;
    thumbnailFolder: string | null;
    thumbnailOriginalName: string | null;
    thumbnailMimeType: string | null;
    thumbnailSize: number | null;
    createdBy: string | null;
    createdByName: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: p.id,
      platform: p.platform,
      postUrl: p.postUrl,
      caption: p.caption,
      isFeatured: p.isFeatured,
      sortOrder: p.sortOrder,
      thumbnail: mediaObject({
        id: p.thumbnailId,
        url: p.thumbnailUrl,
        folder: p.thumbnailFolder,
        originalName: p.thumbnailOriginalName,
        mimeType: p.thumbnailMimeType,
        size: p.thumbnailSize,
      }),
      createdBy: p.createdBy,
      createdByName: p.createdByName,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
