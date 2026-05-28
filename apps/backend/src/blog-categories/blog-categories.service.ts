import {
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
  or,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { adminUsers } from '../database/schema/admin-users.table.js';
import { blogCategories } from '../database/schema/blog-categories.table.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { generateSlug } from '../common/utils/slug.util.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadService } from '../upload/upload.service.js';
import type { CreateBlogCategoryDto } from './dto/create-blog-category.dto.js';
import type { UpdateBlogCategoryDto } from './dto/update-blog-category.dto.js';

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
export class BlogCategoriesService {
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
    statusFilter?: 'draft' | 'published',
    includeDeleted = false,
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'categoryName'
        ? blogCategories.categoryName
        : sortBy === 'sortOrder'
          ? blogCategories.sortOrder
          : sortBy === 'status'
            ? blogCategories.status
            : sortBy === 'createdAt'
              ? blogCategories.createdAt
              : sortBy === 'deletedAt'
                ? blogCategories.deletedAt
                : blogCategories.updatedAt;

    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    conditions.push(
      includeDeleted
        ? isNotNull(blogCategories.deletedAt)
        : isNull(blogCategories.deletedAt),
    );

    if (search) {
      conditions.push(
        or(
          ilike(blogCategories.categoryName, `%${search}%`),
          ilike(blogCategories.slug, `%${search}%`),
        ),
      );
    }

    if (statusFilter) {
      conditions.push(eq(blogCategories.status, statusFilter));
    }

    const whereClause =
      conditions.length > 1
        ? and(
            ...(conditions as [
              ReturnType<typeof or>,
              ...ReturnType<typeof or>[],
            ]),
          )
        : conditions[0];

    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');
    const bannerImg = alias(mediaFiles, 'banner_img');

    const blogsCountSubquery = sql<number>`(
      SELECT COUNT(*)::int
      FROM blog_category_relations
      WHERE blog_category_relations.category_id = ${blogCategories.id}
    )`;

    const [categories, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: blogCategories.id,
          categoryName: blogCategories.categoryName,
          slug: blogCategories.slug,
          status: blogCategories.status,
          bannerImageId: bannerImg.id,
          bannerImageUrl: bannerImg.url,
          bannerImageFolder: bannerImg.folder,
          bannerImageOriginalName: bannerImg.originalName,
          bannerImageMimeType: bannerImg.mimeType,
          bannerImageSize: bannerImg.size,
          sortOrder: blogCategories.sortOrder,
          excerpt: blogCategories.excerpt,
          createdBy: blogCategories.createdBy,
          createdByName: createdByUser.fullName,
          createdAt: blogCategories.createdAt,
          updatedAt: blogCategories.updatedAt,
          blogsCount: blogsCountSubquery,
          deletedAt: blogCategories.deletedAt,
          deletedReason: blogCategories.deletedReason,
          deletedBy: blogCategories.deletedBy,
          deletedByName: deletedByUser.fullName,
        })
        .from(blogCategories)
        .leftJoin(createdByUser, eq(blogCategories.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(blogCategories.deletedBy, deletedByUser.id))
        .leftJoin(bannerImg, eq(blogCategories.bannerImageId, bannerImg.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(blogCategories)
        .where(whereClause),
    ]);

    return {
      data: categories.map((c) => ({
        id: c.id,
        categoryName: c.categoryName,
        slug: c.slug,
        status: c.status,
        bannerImage: mediaObject({
          id: c.bannerImageId,
          url: c.bannerImageUrl,
          folder: c.bannerImageFolder,
          originalName: c.bannerImageOriginalName,
          mimeType: c.bannerImageMimeType,
          size: c.bannerImageSize,
        }),
        sortOrder: c.sortOrder,
        excerpt: c.excerpt,
        createdBy: c.createdBy,
        createdByName: c.createdByName,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        blogsCount: c.blogsCount,
        deletedAt: c.deletedAt,
        deletedReason: c.deletedReason,
        deletedBy: c.deletedBy,
        deletedByName: c.deletedByName,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const createdByUser = alias(adminUsers, 'created_by_user');
    const bannerImg = alias(mediaFiles, 'banner_img');
    const ogImg = alias(mediaFiles, 'og_img');
    const twitterImg = alias(mediaFiles, 'twitter_img');

    const [c] = await this.drizzle.db
      .select({
        id: blogCategories.id,
        categoryName: blogCategories.categoryName,
        slug: blogCategories.slug,
        status: blogCategories.status,
        bannerImageId: bannerImg.id,
        bannerImageUrl: bannerImg.url,
        bannerImageFolder: bannerImg.folder,
        bannerImageOriginalName: bannerImg.originalName,
        bannerImageMimeType: bannerImg.mimeType,
        bannerImageSize: bannerImg.size,
        sortOrder: blogCategories.sortOrder,
        excerpt: blogCategories.excerpt,
        metaTitle: blogCategories.metaTitle,
        metaDescription: blogCategories.metaDescription,
        metaKeywords: blogCategories.metaKeywords,
        canonicalUrl: blogCategories.canonicalUrl,
        ogTitle: blogCategories.ogTitle,
        ogDescription: blogCategories.ogDescription,
        ogImageId: ogImg.id,
        ogImageUrl: ogImg.url,
        ogImageFolder: ogImg.folder,
        ogImageOriginalName: ogImg.originalName,
        ogImageMimeType: ogImg.mimeType,
        ogImageSize: ogImg.size,
        twitterTitle: blogCategories.twitterTitle,
        twitterDescription: blogCategories.twitterDescription,
        twitterImageId: twitterImg.id,
        twitterImageUrl: twitterImg.url,
        twitterImageFolder: twitterImg.folder,
        twitterImageOriginalName: twitterImg.originalName,
        twitterImageMimeType: twitterImg.mimeType,
        twitterImageSize: twitterImg.size,
        robots: blogCategories.robots,
        googlebot: blogCategories.googlebot,
        createdBy: blogCategories.createdBy,
        createdByName: createdByUser.fullName,
        createdAt: blogCategories.createdAt,
        updatedAt: blogCategories.updatedAt,
      })
      .from(blogCategories)
      .leftJoin(createdByUser, eq(blogCategories.createdBy, createdByUser.id))
      .leftJoin(bannerImg, eq(blogCategories.bannerImageId, bannerImg.id))
      .leftJoin(ogImg, eq(blogCategories.ogImageId, ogImg.id))
      .leftJoin(twitterImg, eq(blogCategories.twitterImageId, twitterImg.id))
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!c) throw new NotFoundException('Blog category not found');

    return {
      id: c.id,
      categoryName: c.categoryName,
      slug: c.slug,
      status: c.status,
      bannerImage: mediaObject({
        id: c.bannerImageId,
        url: c.bannerImageUrl,
        folder: c.bannerImageFolder,
        originalName: c.bannerImageOriginalName,
        mimeType: c.bannerImageMimeType,
        size: c.bannerImageSize,
      }),
      sortOrder: c.sortOrder,
      excerpt: c.excerpt,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
      metaKeywords: c.metaKeywords,
      canonicalUrl: c.canonicalUrl,
      ogTitle: c.ogTitle,
      ogDescription: c.ogDescription,
      ogImage: mediaObject({
        id: c.ogImageId,
        url: c.ogImageUrl,
        folder: c.ogImageFolder,
        originalName: c.ogImageOriginalName,
        mimeType: c.ogImageMimeType,
        size: c.ogImageSize,
      }),
      twitterTitle: c.twitterTitle,
      twitterDescription: c.twitterDescription,
      twitterImage: mediaObject({
        id: c.twitterImageId,
        url: c.twitterImageUrl,
        folder: c.twitterImageFolder,
        originalName: c.twitterImageOriginalName,
        mimeType: c.twitterImageMimeType,
        size: c.twitterImageSize,
      }),
      robots: c.robots,
      googlebot: c.googlebot,
      createdBy: c.createdBy,
      createdByName: c.createdByName,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async create(dto: CreateBlogCategoryDto, createdById?: string) {
    const slug = dto.slug ?? generateSlug(dto.categoryName);

    const [existingSlug] = await this.drizzle.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, slug))
      .limit(1);

    if (existingSlug) throw new ConflictException('Slug already in use');

    const [existingName] = await this.drizzle.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.categoryName, dto.categoryName))
      .limit(1);

    if (existingName)
      throw new ConflictException('Category name already in use');

    const [category] = await this.drizzle.db
      .insert(blogCategories)
      .values({
        categoryName: dto.categoryName,
        slug,
        status: dto.status ?? 'draft',
        bannerImageId: dto.bannerImageId,
        sortOrder: dto.sortOrder ?? 0,
        excerpt: dto.excerpt,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        canonicalUrl: dto.canonicalUrl,
        ogTitle: dto.ogTitle,
        ogDescription: dto.ogDescription,
        ogImageId: dto.ogImageId,
        twitterTitle: dto.twitterTitle,
        twitterDescription: dto.twitterDescription,
        twitterImageId: dto.twitterImageId,
        robots: dto.robots ?? 'index',
        googlebot: dto.googlebot ?? 'index',
        createdBy: createdById,
      })
      .returning();

    const result = await this.findOne(category.id);
    this.revalidationService.revalidate([
      'blog-categories',
      `blog-category-${result.slug}`,
    ]);
    return result;
  }

  async update(id: string, dto: UpdateBlogCategoryDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Blog category not found');

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.drizzle.db
        .select()
        .from(blogCategories)
        .where(
          and(eq(blogCategories.slug, dto.slug), ne(blogCategories.id, id)),
        )
        .limit(1);

      if (slugConflict) throw new ConflictException('Slug already in use');
    }

    if (dto.categoryName && dto.categoryName !== existing.categoryName) {
      const [nameConflict] = await this.drizzle.db
        .select()
        .from(blogCategories)
        .where(
          and(
            eq(blogCategories.categoryName, dto.categoryName),
            ne(blogCategories.id, id),
          ),
        )
        .limit(1);

      if (nameConflict)
        throw new ConflictException('Category name already in use');
    }

    // Delete orphaned media files when replaced or removed
    const imageFields = [
      { dtoKey: 'bannerImageId', oldId: existing.bannerImageId },
      { dtoKey: 'ogImageId', oldId: existing.ogImageId },
      { dtoKey: 'twitterImageId', oldId: existing.twitterImageId },
    ] as const;

    for (const { dtoKey, oldId } of imageFields) {
      const newId = dto[dtoKey];
      if (newId !== undefined && newId !== oldId && oldId) {
        await this.uploadService.deleteFile(oldId);
      }
    }

    await this.drizzle.db
      .update(blogCategories)
      .set({
        ...(dto.categoryName !== undefined && {
          categoryName: dto.categoryName,
        }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.bannerImageId !== undefined && {
          bannerImageId: dto.bannerImageId,
        }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && {
          metaDescription: dto.metaDescription,
        }),
        ...(dto.metaKeywords !== undefined && {
          metaKeywords: dto.metaKeywords,
        }),
        ...(dto.canonicalUrl !== undefined && {
          canonicalUrl: dto.canonicalUrl,
        }),
        ...(dto.ogTitle !== undefined && { ogTitle: dto.ogTitle }),
        ...(dto.ogDescription !== undefined && {
          ogDescription: dto.ogDescription,
        }),
        ...(dto.ogImageId !== undefined && { ogImageId: dto.ogImageId }),
        ...(dto.twitterTitle !== undefined && {
          twitterTitle: dto.twitterTitle,
        }),
        ...(dto.twitterDescription !== undefined && {
          twitterDescription: dto.twitterDescription,
        }),
        ...(dto.twitterImageId !== undefined && {
          twitterImageId: dto.twitterImageId,
        }),
        ...(dto.robots !== undefined && { robots: dto.robots }),
        ...(dto.googlebot !== undefined && { googlebot: dto.googlebot }),
        updatedAt: new Date(),
      })
      .where(eq(blogCategories.id, id));

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'blog-categories',
      `blog-category-${result.slug}`,
    ]);
    return result;
  }

  async toggleStatus(id: string) {
    const [category] = await this.drizzle.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!category) throw new NotFoundException('Blog category not found');

    const newStatus = category.status === 'draft' ? 'published' : 'draft';

    await this.drizzle.db
      .update(blogCategories)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(blogCategories.id, id));

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'blog-categories',
      `blog-category-${result.slug}`,
    ]);
    return result;
  }

  async softDelete(id: string, reason: string, deletedById?: string) {
    const [category] = await this.drizzle.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!category) throw new NotFoundException('Blog category not found');

    if (category.deletedAt) {
      throw new ConflictException('Blog category is already deleted');
    }

    await this.drizzle.db
      .update(blogCategories)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: deletedById ?? null,
        updatedAt: new Date(),
      })
      .where(eq(blogCategories.id, id));

    this.revalidationService.revalidate([
      'blog-categories',
      `blog-category-${category.slug}`,
    ]);
    return { message: 'Blog category deleted' };
  }

  async restore(id: string) {
    const [category] = await this.drizzle.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!category) throw new NotFoundException('Blog category not found');

    if (!category.deletedAt) {
      throw new ConflictException('Blog category is not deleted');
    }

    await this.drizzle.db
      .update(blogCategories)
      .set({
        deletedAt: null,
        deletedReason: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(blogCategories.id, id));

    this.revalidationService.revalidate([
      'blog-categories',
      `blog-category-${category.slug}`,
    ]);
    return { message: 'Blog category restored' };
  }

  async permanentDelete(id: string) {
    const [category] = await this.drizzle.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!category) throw new NotFoundException('Blog category not found');

    if (!category.deletedAt) {
      throw new ConflictException(
        'Blog category must be soft-deleted before permanent deletion',
      );
    }

    await this.drizzle.db
      .delete(blogCategories)
      .where(eq(blogCategories.id, id));

    // Delete all stored media files for this category
    await Promise.all(
      [category.bannerImageId, category.ogImageId, category.twitterImageId]
        .filter(Boolean)
        .map((mediaId) => this.uploadService.deleteFile(mediaId!)),
    );

    this.revalidationService.revalidate([
      'blog-categories',
      `blog-category-${category.slug}`,
    ]);
    return { message: 'Blog category permanently deleted' };
  }

  async revalidateOne(id: string): Promise<{ revalidated: boolean }> {
    const [row] = await this.drizzle.db
      .select({ slug: blogCategories.slug })
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Blog category not found');
    this.revalidationService.revalidate([
      'blog-categories',
      `blog-category-${row.slug}`,
    ]);
    return { revalidated: true };
  }

  revalidateAll(): { revalidated: boolean } {
    this.revalidationService.revalidate(['blog-categories']);
    return { revalidated: true };
  }
}
