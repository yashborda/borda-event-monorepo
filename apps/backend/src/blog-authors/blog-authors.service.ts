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
  or,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { adminUsers } from '../database/schema/admin-users.table.js';
import { blogAuthors } from '../database/schema/blog-authors.table.js';
import { blogs } from '../database/schema/blogs.table.js';
import { mediaFiles } from '../database/schema/media-files.table.js';
import { generateSlug } from '../common/utils/slug.util.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { UploadService } from '../upload/upload.service.js';
import type { CreateBlogAuthorDto } from './dto/create-blog-author.dto.js';
import type { UpdateBlogAuthorDto } from './dto/update-blog-author.dto.js';

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
export class BlogAuthorsService {
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
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'fullName'
        ? blogAuthors.fullName
        : sortBy === 'email'
          ? blogAuthors.email
          : sortBy === 'status'
            ? blogAuthors.status
            : sortBy === 'createdAt'
              ? blogAuthors.createdAt
              : sortBy === 'deletedAt'
                ? blogAuthors.deletedAt
                : blogAuthors.updatedAt;

    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(blogAuthors.deletedAt));
    } else {
      conditions.push(isNotNull(blogAuthors.deletedAt));
    }

    if (search) {
      conditions.push(
        or(
          ilike(blogAuthors.fullName, `%${search}%`),
          ilike(blogAuthors.email, `%${search}%`),
        ),
      );
    }

    if (statusFilter === 'active' || statusFilter === 'inactive') {
      conditions.push(eq(blogAuthors.status, statusFilter));
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
    const avatarImg = alias(mediaFiles, 'avatar_img');

    const blogsCountSubquery = sql<number>`(
      SELECT COUNT(*)::int
      FROM blogs
      WHERE blogs.author_id = ${blogAuthors.id}
        AND blogs.deleted_at IS NULL
    )`;

    const [authors, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: blogAuthors.id,
          fullName: blogAuthors.fullName,
          slug: blogAuthors.slug,
          email: blogAuthors.email,
          avatarId: avatarImg.id,
          avatarUrl: avatarImg.url,
          avatarFolder: avatarImg.folder,
          avatarOriginalName: avatarImg.originalName,
          avatarMimeType: avatarImg.mimeType,
          avatarSize: avatarImg.size,
          designation: blogAuthors.designation,
          status: blogAuthors.status,
          createdBy: blogAuthors.createdBy,
          createdByName: createdByUser.fullName,
          deletedAt: blogAuthors.deletedAt,
          deletedReason: blogAuthors.deletedReason,
          deletedBy: blogAuthors.deletedBy,
          deletedByName: deletedByUser.fullName,
          createdAt: blogAuthors.createdAt,
          updatedAt: blogAuthors.updatedAt,
          numberOfBlogsWritten: blogsCountSubquery,
        })
        .from(blogAuthors)
        .leftJoin(createdByUser, eq(blogAuthors.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(blogAuthors.deletedBy, deletedByUser.id))
        .leftJoin(avatarImg, eq(blogAuthors.avatarId, avatarImg.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(blogAuthors)
        .where(whereClause),
    ]);

    return {
      data: authors.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        slug: a.slug,
        email: a.email,
        avatar: mediaObject({
          id: a.avatarId,
          url: a.avatarUrl,
          folder: a.avatarFolder,
          originalName: a.avatarOriginalName,
          mimeType: a.avatarMimeType,
          size: a.avatarSize,
        }),
        designation: a.designation,
        status: a.status,
        createdBy: a.createdBy,
        createdByName: a.createdByName,
        deletedAt: a.deletedAt,
        deletedReason: a.deletedReason,
        deletedBy: a.deletedBy,
        deletedByName: a.deletedByName,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        numberOfBlogsWritten: a.numberOfBlogsWritten,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');
    const avatarImg = alias(mediaFiles, 'avatar_img');

    const [a] = await this.drizzle.db
      .select({
        id: blogAuthors.id,
        fullName: blogAuthors.fullName,
        slug: blogAuthors.slug,
        email: blogAuthors.email,
        avatarId: avatarImg.id,
        avatarUrl: avatarImg.url,
        avatarFolder: avatarImg.folder,
        avatarOriginalName: avatarImg.originalName,
        avatarMimeType: avatarImg.mimeType,
        avatarSize: avatarImg.size,
        bio: blogAuthors.bio,
        designation: blogAuthors.designation,
        website: blogAuthors.website,
        twitter: blogAuthors.twitter,
        linkedin: blogAuthors.linkedin,
        instagram: blogAuthors.instagram,
        status: blogAuthors.status,
        createdBy: blogAuthors.createdBy,
        createdByName: createdByUser.fullName,
        deletedAt: blogAuthors.deletedAt,
        deletedReason: blogAuthors.deletedReason,
        deletedBy: blogAuthors.deletedBy,
        deletedByName: deletedByUser.fullName,
        createdAt: blogAuthors.createdAt,
        updatedAt: blogAuthors.updatedAt,
      })
      .from(blogAuthors)
      .leftJoin(createdByUser, eq(blogAuthors.createdBy, createdByUser.id))
      .leftJoin(deletedByUser, eq(blogAuthors.deletedBy, deletedByUser.id))
      .leftJoin(avatarImg, eq(blogAuthors.avatarId, avatarImg.id))
      .where(eq(blogAuthors.id, id))
      .limit(1);

    if (!a) throw new NotFoundException('Blog author not found');

    return {
      id: a.id,
      fullName: a.fullName,
      slug: a.slug,
      email: a.email,
      avatar: mediaObject({
        id: a.avatarId,
        url: a.avatarUrl,
        folder: a.avatarFolder,
        originalName: a.avatarOriginalName,
        mimeType: a.avatarMimeType,
        size: a.avatarSize,
      }),
      bio: a.bio,
      designation: a.designation,
      website: a.website,
      twitter: a.twitter,
      linkedin: a.linkedin,
      instagram: a.instagram,
      status: a.status,
      createdBy: a.createdBy,
      createdByName: a.createdByName,
      deletedAt: a.deletedAt,
      deletedReason: a.deletedReason,
      deletedBy: a.deletedBy,
      deletedByName: a.deletedByName,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  async create(dto: CreateBlogAuthorDto, createdById?: string) {
    const slug = dto.slug ?? generateSlug(dto.fullName);

    const [existingSlug] = await this.drizzle.db
      .select()
      .from(blogAuthors)
      .where(eq(blogAuthors.slug, slug))
      .limit(1);

    if (existingSlug) throw new ConflictException('Slug already in use');

    const [existingEmail] = await this.drizzle.db
      .select()
      .from(blogAuthors)
      .where(eq(blogAuthors.email, dto.email))
      .limit(1);

    if (existingEmail) throw new ConflictException('Email already in use');

    const [author] = await this.drizzle.db
      .insert(blogAuthors)
      .values({
        fullName: dto.fullName,
        slug,
        email: dto.email,
        avatarId: dto.avatarId,
        bio: dto.bio,
        designation: dto.designation,
        website: dto.website,
        twitter: dto.twitter,
        linkedin: dto.linkedin,
        instagram: dto.instagram,
        status: dto.status ?? 'active',
        createdBy: createdById,
      })
      .returning();

    const result = await this.findOne(author.id);
    this.revalidationService.revalidate([
      'blog-authors',
      `blog-author-${result.slug}`,
    ]);
    return result;
  }

  async update(id: string, dto: UpdateBlogAuthorDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(blogAuthors)
      .where(eq(blogAuthors.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Blog author not found');
    if (existing.deletedAt)
      throw new BadRequestException('Cannot update a deleted author');

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.drizzle.db
        .select()
        .from(blogAuthors)
        .where(and(eq(blogAuthors.slug, dto.slug), ne(blogAuthors.id, id)))
        .limit(1);

      if (slugConflict) throw new ConflictException('Slug already in use');
    }

    if (dto.email && dto.email !== existing.email) {
      const [emailConflict] = await this.drizzle.db
        .select()
        .from(blogAuthors)
        .where(and(eq(blogAuthors.email, dto.email), ne(blogAuthors.id, id)))
        .limit(1);

      if (emailConflict) throw new ConflictException('Email already in use');
    }

    if (
      dto.avatarId !== undefined &&
      dto.avatarId !== existing.avatarId &&
      existing.avatarId
    ) {
      await this.uploadService.deleteFile(existing.avatarId);
    }

    await this.drizzle.db
      .update(blogAuthors)
      .set({
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.avatarId !== undefined && { avatarId: dto.avatarId }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.designation !== undefined && { designation: dto.designation }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.twitter !== undefined && { twitter: dto.twitter }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
        ...(dto.instagram !== undefined && { instagram: dto.instagram }),
        ...(dto.status !== undefined && { status: dto.status }),
        updatedAt: new Date(),
      })
      .where(eq(blogAuthors.id, id));

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'blog-authors',
      `blog-author-${result.slug}`,
    ]);
    return result;
  }

  async softDelete(id: string, reason: string, deletedById?: string) {
    const [author] = await this.drizzle.db
      .select()
      .from(blogAuthors)
      .where(eq(blogAuthors.id, id))
      .limit(1);

    if (!author) throw new NotFoundException('Blog author not found');
    if (author.deletedAt)
      throw new BadRequestException('Author is already deleted');

    await this.drizzle.db
      .update(blogAuthors)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: deletedById,
        updatedAt: new Date(),
      })
      .where(eq(blogAuthors.id, id));

    this.revalidationService.revalidate([
      'blog-authors',
      `blog-author-${author.slug}`,
    ]);
    return { message: 'Blog author deleted' };
  }

  async restore(id: string) {
    const [author] = await this.drizzle.db
      .select()
      .from(blogAuthors)
      .where(eq(blogAuthors.id, id))
      .limit(1);

    if (!author) throw new NotFoundException('Blog author not found');
    if (!author.deletedAt)
      throw new BadRequestException('Author is not deleted');

    await this.drizzle.db
      .update(blogAuthors)
      .set({
        deletedAt: null,
        deletedReason: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(blogAuthors.id, id));

    this.revalidationService.revalidate([
      'blog-authors',
      `blog-author-${author.slug}`,
    ]);
    return { message: 'Blog author restored' };
  }

  async permanentDelete(id: string, transferToAuthorId?: string) {
    const [author] = await this.drizzle.db
      .select()
      .from(blogAuthors)
      .where(eq(blogAuthors.id, id))
      .limit(1);

    if (!author) throw new NotFoundException('Blog author not found');
    if (!author.deletedAt)
      throw new BadRequestException(
        'Author must be soft-deleted before permanent deletion',
      );

    if (transferToAuthorId) {
      const [transferTarget] = await this.drizzle.db
        .select()
        .from(blogAuthors)
        .where(eq(blogAuthors.id, transferToAuthorId))
        .limit(1);

      if (!transferTarget)
        throw new NotFoundException('Transfer target author not found');

      if (transferTarget.id === id)
        throw new BadRequestException(
          'Transfer target cannot be the same author being deleted',
        );

      await this.drizzle.db
        .update(blogs)
        .set({ authorId: transferToAuthorId, updatedAt: new Date() })
        .where(and(eq(blogs.authorId, id), isNull(blogs.deletedAt)));
    }

    await this.drizzle.db.delete(blogAuthors).where(eq(blogAuthors.id, id));

    if (author.avatarId) {
      await this.uploadService.deleteFile(author.avatarId);
    }

    this.revalidationService.revalidate([
      'blog-authors',
      `blog-author-${author.slug}`,
    ]);
    return { message: 'Blog author permanently deleted' };
  }

  async revalidateOne(id: string): Promise<{ revalidated: boolean }> {
    const [row] = await this.drizzle.db
      .select({ slug: blogAuthors.slug })
      .from(blogAuthors)
      .where(eq(blogAuthors.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Blog author not found');
    this.revalidationService.revalidate([
      'blog-authors',
      `blog-author-${row.slug}`,
    ]);
    return { revalidated: true };
  }

  revalidateAll(): { revalidated: boolean } {
    this.revalidationService.revalidate(['blog-authors']);
    return { revalidated: true };
  }
}
