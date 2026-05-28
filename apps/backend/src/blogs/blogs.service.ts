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
  or,
  sql,
} from 'drizzle-orm';
import { DrizzleService } from '../database/drizzle.service.js';
import { adminUsers } from '../database/schema/admin-users.table.js';
import { blogAuthors } from '../database/schema/blog-authors.table.js';
import { blogCategories } from '../database/schema/blog-categories.table.js';
import { blogCategoryRelations } from '../database/schema/blog-category-relations.table.js';
import { blogTagRelations } from '../database/schema/blog-tag-relations.table.js';
import { blogTags } from '../database/schema/blog-tags.table.js';
import { blogs } from '../database/schema/blogs.table.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { generateSlug } from '../common/utils/slug.util.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadService } from '../upload/upload.service.js';
import type { CreateBlogDto } from './dto/create-blog.dto.js';
import type { UpdateBlogDto } from './dto/update-blog.dto.js';
import { alias } from 'drizzle-orm/pg-core';

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
export class BlogsService {
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
    statusFilter?: string,
    categoryId?: string,
    tagId?: string,
    authorId?: string,
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'title'
        ? blogs.title
        : sortBy === 'publishedAt'
          ? blogs.publishedAt
          : sortBy === 'createdAt'
            ? blogs.createdAt
            : sortBy === 'deletedAt'
              ? blogs.deletedAt
              : blogs.updatedAt;

    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(blogs.deletedAt));
    } else {
      conditions.push(isNotNull(blogs.deletedAt));
    }

    if (search) {
      conditions.push(
        or(ilike(blogs.title, `%${search}%`), ilike(blogs.slug, `%${search}%`)),
      );
    }

    if (statusFilter) {
      conditions.push(eq(blogs.status, statusFilter as 'draft' | 'published'));
    }

    if (categoryId) {
      const relRows = await this.drizzle.db
        .select({ blogId: blogCategoryRelations.blogId })
        .from(blogCategoryRelations)
        .where(eq(blogCategoryRelations.categoryId, categoryId));
      const ids = relRows.map((r) => r.blogId);
      if (ids.length === 0) return { data: [], total: 0, page, limit };
      conditions.push(inArray(blogs.id, ids));
    }

    if (tagId) {
      const relRows = await this.drizzle.db
        .select({ blogId: blogTagRelations.blogId })
        .from(blogTagRelations)
        .where(eq(blogTagRelations.tagId, tagId));
      const ids = relRows.map((r) => r.blogId);
      if (ids.length === 0) return { data: [], total: 0, page, limit };
      conditions.push(inArray(blogs.id, ids));
    }

    if (authorId) {
      conditions.push(eq(blogs.authorId, authorId));
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

    const createdByUser = this.drizzle.db
      .select({ id: adminUsers.id, fullName: adminUsers.fullName })
      .from(adminUsers)
      .as('created_by_user');

    const deletedByUser = this.drizzle.db
      .select({ id: adminUsers.id, fullName: adminUsers.fullName })
      .from(adminUsers)
      .as('deleted_by_user');

    const featuredImg = alias(mediaFiles, 'featured_img');
    const authorAvatarImg = alias(mediaFiles, 'author_avatar_img');

    const [rows, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          excerpt: blogs.excerpt,
          featuredImageId: featuredImg.id,
          featuredImageUrl: featuredImg.url,
          featuredImageFolder: featuredImg.folder,
          featuredImageOriginalName: featuredImg.originalName,
          featuredImageMimeType: featuredImg.mimeType,
          featuredImageSize: featuredImg.size,
          status: blogs.status,
          publishedAt: blogs.publishedAt,
          isFeatured: blogs.isFeatured,
          viewCount: blogs.viewCount,
          likeCount: blogs.likeCount,
          readingTime: blogs.readingTime,
          authorId: blogs.authorId,
          authorFullName: blogAuthors.fullName,
          authorSlug: blogAuthors.slug,
          authorAvatarId: authorAvatarImg.id,
          authorAvatarUrl: authorAvatarImg.url,
          authorAvatarFolder: authorAvatarImg.folder,
          authorAvatarOriginalName: authorAvatarImg.originalName,
          authorAvatarMimeType: authorAvatarImg.mimeType,
          authorAvatarSize: authorAvatarImg.size,
          createdBy: blogs.createdBy,
          createdByName: createdByUser.fullName,
          deletedAt: blogs.deletedAt,
          deletedReason: blogs.deletedReason,
          deletedBy: blogs.deletedBy,
          deletedByName: deletedByUser.fullName,
          createdAt: blogs.createdAt,
          updatedAt: blogs.updatedAt,
        })
        .from(blogs)
        .leftJoin(blogAuthors, eq(blogs.authorId, blogAuthors.id))
        .leftJoin(authorAvatarImg, eq(blogAuthors.avatarId, authorAvatarImg.id))
        .leftJoin(featuredImg, eq(blogs.featuredImageId, featuredImg.id))
        .leftJoin(createdByUser, eq(blogs.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(blogs.deletedBy, deletedByUser.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db.select({ total: count() }).from(blogs).where(whereClause),
    ]);

    if (rows.length === 0) {
      return { data: [], total, page, limit };
    }

    const blogIds = rows.map((r) => r.id);

    const [categoryRows, tagRows] = await Promise.all([
      this.drizzle.db
        .select({
          blogId: blogCategoryRelations.blogId,
          id: blogCategories.id,
          categoryName: blogCategories.categoryName,
          slug: blogCategories.slug,
        })
        .from(blogCategoryRelations)
        .innerJoin(
          blogCategories,
          eq(blogCategoryRelations.categoryId, blogCategories.id),
        )
        .where(inArray(blogCategoryRelations.blogId, blogIds)),
      this.drizzle.db
        .select({
          blogId: blogTagRelations.blogId,
          id: blogTags.id,
          name: blogTags.name,
          slug: blogTags.slug,
        })
        .from(blogTagRelations)
        .innerJoin(blogTags, eq(blogTagRelations.tagId, blogTags.id))
        .where(inArray(blogTagRelations.blogId, blogIds)),
    ]);

    const categoriesByBlog = new Map<
      string,
      { id: string; categoryName: string; slug: string }[]
    >();
    for (const row of categoryRows) {
      if (!categoriesByBlog.has(row.blogId)) {
        categoriesByBlog.set(row.blogId, []);
      }
      categoriesByBlog.get(row.blogId)!.push({
        id: row.id,
        categoryName: row.categoryName,
        slug: row.slug,
      });
    }

    const tagsByBlog = new Map<
      string,
      { id: string; name: string; slug: string }[]
    >();
    for (const row of tagRows) {
      if (!tagsByBlog.has(row.blogId)) {
        tagsByBlog.set(row.blogId, []);
      }
      tagsByBlog.get(row.blogId)!.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
      });
    }

    const data = rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      featuredImage: mediaObject({
        id: row.featuredImageId,
        url: row.featuredImageUrl,
        folder: row.featuredImageFolder,
        originalName: row.featuredImageOriginalName,
        mimeType: row.featuredImageMimeType,
        size: row.featuredImageSize,
      }),
      status: row.status,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      isFeatured: row.isFeatured,
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      readingTime: row.readingTime,
      author: row.authorId
        ? {
            id: row.authorId,
            fullName: row.authorFullName,
            slug: row.authorSlug,
            avatar: mediaObject({
              id: row.authorAvatarId,
              url: row.authorAvatarUrl,
              folder: row.authorAvatarFolder,
              originalName: row.authorAvatarOriginalName,
              mimeType: row.authorAvatarMimeType,
              size: row.authorAvatarSize,
            }),
          }
        : null,
      categories: categoriesByBlog.get(row.id) ?? [],
      tags: tagsByBlog.get(row.id) ?? [],
      createdBy: row.createdBy,
      createdByName: row.createdByName,
      deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
      deletedReason: row.deletedReason,
      deletedBy: row.deletedBy,
      deletedByName: row.deletedByName,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const featuredImg = alias(mediaFiles, 'featured_img');
    const ogImg = alias(mediaFiles, 'og_img');
    const twitterImg = alias(mediaFiles, 'twitter_img');
    const authorAvatarImg = alias(mediaFiles, 'author_avatar_img');

    const [row] = await this.drizzle.db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        excerpt: blogs.excerpt,
        content: blogs.content,
        featuredImageId: featuredImg.id,
        featuredImageUrl: featuredImg.url,
        featuredImageFolder: featuredImg.folder,
        featuredImageOriginalName: featuredImg.originalName,
        featuredImageMimeType: featuredImg.mimeType,
        featuredImageSize: featuredImg.size,
        featuredImageAlt: blogs.featuredImageAlt,
        status: blogs.status,
        publishedAt: blogs.publishedAt,
        isFeatured: blogs.isFeatured,
        viewCount: blogs.viewCount,
        likeCount: blogs.likeCount,
        readingTime: blogs.readingTime,
        metaTitle: blogs.metaTitle,
        metaDescription: blogs.metaDescription,
        metaKeywords: blogs.metaKeywords,
        canonicalUrl: blogs.canonicalUrl,
        ogTitle: blogs.ogTitle,
        ogDescription: blogs.ogDescription,
        ogImageId: ogImg.id,
        ogImageUrl: ogImg.url,
        ogImageFolder: ogImg.folder,
        ogImageOriginalName: ogImg.originalName,
        ogImageMimeType: ogImg.mimeType,
        ogImageSize: ogImg.size,
        twitterTitle: blogs.twitterTitle,
        twitterDescription: blogs.twitterDescription,
        twitterImageId: twitterImg.id,
        twitterImageUrl: twitterImg.url,
        twitterImageFolder: twitterImg.folder,
        twitterImageOriginalName: twitterImg.originalName,
        twitterImageMimeType: twitterImg.mimeType,
        twitterImageSize: twitterImg.size,
        robots: blogs.robots,
        googlebot: blogs.googlebot,
        authorId: blogs.authorId,
        authorFullName: blogAuthors.fullName,
        authorSlug: blogAuthors.slug,
        authorAvatarId: authorAvatarImg.id,
        authorAvatarUrl: authorAvatarImg.url,
        authorAvatarFolder: authorAvatarImg.folder,
        authorAvatarOriginalName: authorAvatarImg.originalName,
        authorAvatarMimeType: authorAvatarImg.mimeType,
        authorAvatarSize: authorAvatarImg.size,
        createdBy: blogs.createdBy,
        deletedAt: blogs.deletedAt,
        deletedReason: blogs.deletedReason,
        deletedBy: blogs.deletedBy,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
      })
      .from(blogs)
      .leftJoin(blogAuthors, eq(blogs.authorId, blogAuthors.id))
      .leftJoin(authorAvatarImg, eq(blogAuthors.avatarId, authorAvatarImg.id))
      .leftJoin(featuredImg, eq(blogs.featuredImageId, featuredImg.id))
      .leftJoin(ogImg, eq(blogs.ogImageId, ogImg.id))
      .leftJoin(twitterImg, eq(blogs.twitterImageId, twitterImg.id))
      .where(eq(blogs.id, id))
      .limit(1);

    if (!row) throw new NotFoundException('Blog not found');

    const [categoryRows, tagRows] = await Promise.all([
      this.drizzle.db
        .select({
          id: blogCategories.id,
          categoryName: blogCategories.categoryName,
          slug: blogCategories.slug,
        })
        .from(blogCategoryRelations)
        .innerJoin(
          blogCategories,
          eq(blogCategoryRelations.categoryId, blogCategories.id),
        )
        .where(eq(blogCategoryRelations.blogId, id)),
      this.drizzle.db
        .select({
          id: blogTags.id,
          name: blogTags.name,
          slug: blogTags.slug,
        })
        .from(blogTagRelations)
        .innerJoin(blogTags, eq(blogTagRelations.tagId, blogTags.id))
        .where(eq(blogTagRelations.blogId, id)),
    ]);

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      featuredImage: mediaObject({
        id: row.featuredImageId,
        url: row.featuredImageUrl,
        folder: row.featuredImageFolder,
        originalName: row.featuredImageOriginalName,
        mimeType: row.featuredImageMimeType,
        size: row.featuredImageSize,
      }),
      featuredImageAlt: row.featuredImageAlt,
      status: row.status,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      isFeatured: row.isFeatured,
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      readingTime: row.readingTime,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      metaKeywords: row.metaKeywords,
      canonicalUrl: row.canonicalUrl,
      ogTitle: row.ogTitle,
      ogDescription: row.ogDescription,
      ogImage: mediaObject({
        id: row.ogImageId,
        url: row.ogImageUrl,
        folder: row.ogImageFolder,
        originalName: row.ogImageOriginalName,
        mimeType: row.ogImageMimeType,
        size: row.ogImageSize,
      }),
      twitterTitle: row.twitterTitle,
      twitterDescription: row.twitterDescription,
      twitterImage: mediaObject({
        id: row.twitterImageId,
        url: row.twitterImageUrl,
        folder: row.twitterImageFolder,
        originalName: row.twitterImageOriginalName,
        mimeType: row.twitterImageMimeType,
        size: row.twitterImageSize,
      }),
      robots: row.robots,
      googlebot: row.googlebot,
      author: row.authorId
        ? {
            id: row.authorId,
            fullName: row.authorFullName,
            slug: row.authorSlug,
            avatar: mediaObject({
              id: row.authorAvatarId,
              url: row.authorAvatarUrl,
              folder: row.authorAvatarFolder,
              originalName: row.authorAvatarOriginalName,
              mimeType: row.authorAvatarMimeType,
              size: row.authorAvatarSize,
            }),
          }
        : null,
      categories: categoryRows,
      tags: tagRows,
      createdBy: row.createdBy,
      deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
      deletedReason: row.deletedReason,
      deletedBy: row.deletedBy,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async create(dto: CreateBlogDto, createdById?: string) {
    const slug = dto.slug ? dto.slug : generateSlug(dto.title);

    const existing = await this.drizzle.db
      .select({ id: blogs.id })
      .from(blogs)
      .where(eq(blogs.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(`Slug "${slug}" is already in use`);
    }

    const readingTime = this.calculateReadingTime(dto.content);

    const [blog] = await this.drizzle.db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(blogs)
        .values({
          title: dto.title,
          slug,
          excerpt: dto.excerpt,
          content: dto.content,
          authorId: dto.authorId,
          featuredImageId: dto.featuredImageId,
          featuredImageAlt: dto.featuredImageAlt,
          status: (dto.status as 'draft' | 'published') ?? 'draft',
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
          isFeatured: dto.isFeatured ?? false,
          readingTime,
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
          robots: (dto.robots as 'index' | 'noindex') ?? 'index',
          googlebot: (dto.googlebot as 'index' | 'noindex') ?? 'index',
          createdBy: createdById,
        })
        .returning();

      if (dto.categoryIds && dto.categoryIds.length > 0) {
        await tx
          .insert(blogCategoryRelations)
          .values(
            dto.categoryIds.map((categoryId) => ({
              blogId: inserted.id,
              categoryId,
            })),
          )
          .onConflictDoNothing();
      }

      if (dto.tagIds && dto.tagIds.length > 0) {
        await tx
          .insert(blogTagRelations)
          .values(dto.tagIds.map((tagId) => ({ blogId: inserted.id, tagId })))
          .onConflictDoNothing();
      }

      return [inserted];
    });

    const result = await this.findOne(blog.id);
    const tags = await this.fetchBlogTags(blog.id, result.slug);
    this.revalidationService.revalidate(tags);
    return result;
  }

  async update(id: string, dto: UpdateBlogDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Blog not found');
    if (existing.deletedAt)
      throw new BadRequestException('Cannot update a deleted blog');

    if (dto.slug && dto.slug !== existing.slug) {
      const slugConflict = await this.drizzle.db
        .select({ id: blogs.id })
        .from(blogs)
        .where(and(eq(blogs.slug, dto.slug), sql`${blogs.id} != ${id}::uuid`))
        .limit(1);

      if (slugConflict.length > 0) {
        throw new ConflictException(`Slug "${dto.slug}" is already in use`);
      }
    }

    const readingTime =
      dto.content !== undefined
        ? this.calculateReadingTime(dto.content)
        : existing.readingTime;

    // Delete orphaned media files when replaced or removed
    const imageFields = [
      { dtoKey: 'featuredImageId', oldId: existing.featuredImageId },
      { dtoKey: 'ogImageId', oldId: existing.ogImageId },
      { dtoKey: 'twitterImageId', oldId: existing.twitterImageId },
    ] as const;

    for (const { dtoKey, oldId } of imageFields) {
      const newId = dto[dtoKey];
      if (newId !== undefined && newId !== oldId && oldId) {
        await this.uploadService.deleteFile(oldId);
      }
    }

    await this.drizzle.db.transaction(async (tx) => {
      await tx
        .update(blogs)
        .set({
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
          ...(dto.content !== undefined && { content: dto.content }),
          ...(dto.authorId !== undefined && { authorId: dto.authorId }),
          ...(dto.featuredImageId !== undefined && {
            featuredImageId: dto.featuredImageId,
          }),
          ...(dto.featuredImageAlt !== undefined && {
            featuredImageAlt: dto.featuredImageAlt,
          }),
          ...(dto.status !== undefined && {
            status: dto.status as 'draft' | 'published',
          }),
          ...(dto.publishedAt !== undefined && {
            publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
          }),
          ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
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
          ...(dto.robots !== undefined && {
            robots: dto.robots as 'index' | 'noindex',
          }),
          ...(dto.googlebot !== undefined && {
            googlebot: dto.googlebot as 'index' | 'noindex',
          }),
          readingTime,
          updatedAt: new Date(),
        })
        .where(eq(blogs.id, id));

      if (dto.categoryIds !== undefined) {
        await tx
          .delete(blogCategoryRelations)
          .where(eq(blogCategoryRelations.blogId, id));

        if (dto.categoryIds.length > 0) {
          await tx
            .insert(blogCategoryRelations)
            .values(
              dto.categoryIds.map((categoryId) => ({ blogId: id, categoryId })),
            )
            .onConflictDoNothing();
        }
      }

      if (dto.tagIds !== undefined) {
        await tx
          .delete(blogTagRelations)
          .where(eq(blogTagRelations.blogId, id));

        if (dto.tagIds.length > 0) {
          await tx
            .insert(blogTagRelations)
            .values(dto.tagIds.map((tagId) => ({ blogId: id, tagId })))
            .onConflictDoNothing();
        }
      }
    });

    const result = await this.findOne(id);
    const tags = await this.fetchBlogTags(id, result.slug);
    this.revalidationService.revalidate(tags);
    return result;
  }

  async softDelete(id: string, reason: string, deletedById?: string) {
    const [existing] = await this.drizzle.db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Blog not found');
    if (existing.deletedAt)
      throw new BadRequestException('Blog is already deleted');

    await this.drizzle.db
      .update(blogs)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: deletedById,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id));

    const tags = await this.fetchBlogTags(id, existing.slug);
    this.revalidationService.revalidate(tags);
    return { message: 'Blog deleted' };
  }

  async restore(id: string) {
    const [existing] = await this.drizzle.db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Blog not found');
    if (!existing.deletedAt)
      throw new BadRequestException('Blog is not deleted');

    await this.drizzle.db
      .update(blogs)
      .set({
        deletedAt: null,
        deletedReason: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id));

    const tags = await this.fetchBlogTags(id, existing.slug);
    this.revalidationService.revalidate(tags);
    return { message: 'Blog restored' };
  }

  async permanentDelete(id: string) {
    const [existing] = await this.drizzle.db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Blog not found');
    if (!existing.deletedAt) {
      throw new BadRequestException(
        'Blog must be soft-deleted before permanent deletion',
      );
    }

    const tags = await this.fetchBlogTags(id, existing.slug);

    await this.drizzle.db.delete(blogs).where(eq(blogs.id, id));

    // Delete all stored media files for this blog
    await Promise.all(
      [existing.featuredImageId, existing.ogImageId, existing.twitterImageId]
        .filter(Boolean)
        .map((mediaId) => this.uploadService.deleteFile(mediaId!)),
    );

    this.revalidationService.revalidate(tags);
    return { message: 'Blog permanently deleted' };
  }

  async publish(id: string, _publishedById?: string) {
    const [existing] = await this.drizzle.db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Blog not found');
    if (existing.deletedAt)
      throw new BadRequestException('Cannot publish a deleted blog');

    await this.drizzle.db
      .update(blogs)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id));

    const result = await this.findOne(id);
    const tags = await this.fetchBlogTags(id, result.slug);
    this.revalidationService.revalidate(tags);
    return result;
  }

  async revalidateOne(id: string): Promise<{ revalidated: boolean }> {
    const [row] = await this.drizzle.db
      .select({ slug: blogs.slug })
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Blog not found');
    const tags = await this.fetchBlogTags(id, row.slug);
    this.revalidationService.revalidate(tags);
    return { revalidated: true };
  }

  revalidateAll(): { revalidated: boolean } {
    this.revalidationService.revalidate(['blogs']);
    return { revalidated: true };
  }

  private async fetchBlogTags(
    blogId: string,
    blogSlug: string,
  ): Promise<string[]> {
    const [authorRows, categoryRows, tagRows] = await Promise.all([
      this.drizzle.db
        .select({ authorSlug: blogAuthors.slug })
        .from(blogs)
        .leftJoin(blogAuthors, eq(blogs.authorId, blogAuthors.id))
        .where(eq(blogs.id, blogId))
        .limit(1),
      this.drizzle.db
        .select({ slug: blogCategories.slug })
        .from(blogCategoryRelations)
        .innerJoin(
          blogCategories,
          eq(blogCategoryRelations.categoryId, blogCategories.id),
        )
        .where(eq(blogCategoryRelations.blogId, blogId)),
      this.drizzle.db
        .select({ slug: blogTags.slug })
        .from(blogTagRelations)
        .innerJoin(blogTags, eq(blogTagRelations.tagId, blogTags.id))
        .where(eq(blogTagRelations.blogId, blogId)),
    ]);

    return [
      'blogs',
      `blog-${blogSlug}`,
      ...(authorRows[0]?.authorSlug
        ? [`blog-author-${authorRows[0].authorSlug}`]
        : []),
      ...categoryRows.map((r) => `blog-category-${r.slug}`),
      ...tagRows.map((r) => `blog-tag-${r.slug}`),
    ];
  }

  private calculateReadingTime(content?: string): number {
    if (!content) return 0;
    const text = content.replace(/<[^>]+>/g, ' ');
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    return Math.max(1, Math.ceil(words.length / 200));
  }
}
