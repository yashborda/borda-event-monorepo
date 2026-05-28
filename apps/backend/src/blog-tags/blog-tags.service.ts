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
import { blogTags } from '../database/schema/blog-tags.table.js';
import { RevalidationService } from '../common/services/revalidation.service.js';
import { generateSlug } from '../common/utils/slug.util.js';
import type { CreateBlogTagDto } from './dto/create-blog-tag.dto.js';
import type { UpdateBlogTagDto } from './dto/update-blog-tag.dto.js';

@Injectable()
export class BlogTagsService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly revalidationService: RevalidationService,
  ) {}

  async listAll(
    page = 1,
    limit = 20,
    search?: string,
    sortBy = 'updatedAt',
    sortDir: 'asc' | 'desc' = 'desc',
    includeDeleted = false,
    statusFilter?: 'draft' | 'published',
  ) {
    const offset = (page - 1) * limit;

    const sortColumn =
      sortBy === 'name'
        ? blogTags.name
        : sortBy === 'sortOrder'
          ? blogTags.sortOrder
          : sortBy === 'status'
            ? blogTags.status
            : sortBy === 'createdAt'
              ? blogTags.createdAt
              : sortBy === 'deletedAt'
                ? blogTags.deletedAt
                : blogTags.updatedAt;

    const orderExpr = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];

    if (!includeDeleted) {
      conditions.push(isNull(blogTags.deletedAt));
    } else {
      conditions.push(isNotNull(blogTags.deletedAt));
    }

    if (statusFilter) {
      conditions.push(eq(blogTags.status, statusFilter));
    }

    if (search) {
      conditions.push(
        or(
          ilike(blogTags.name, `%${search}%`),
          ilike(blogTags.slug, `%${search}%`),
        ),
      );
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

    const blogsCountSubquery = sql<number>`(
      SELECT COUNT(*)::int
      FROM blog_tag_relations
      INNER JOIN blogs ON blogs.id = blog_tag_relations.blog_id
      WHERE blog_tag_relations.tag_id = ${blogTags.id}
        AND blogs.deleted_at IS NULL
    )`;

    const [tags, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: blogTags.id,
          name: blogTags.name,
          slug: blogTags.slug,
          sortOrder: blogTags.sortOrder,
          status: blogTags.status,
          excerpt: blogTags.excerpt,
          createdBy: blogTags.createdBy,
          createdByName: createdByUser.fullName,
          deletedAt: blogTags.deletedAt,
          deletedReason: blogTags.deletedReason,
          deletedBy: blogTags.deletedBy,
          deletedByName: deletedByUser.fullName,
          createdAt: blogTags.createdAt,
          updatedAt: blogTags.updatedAt,
          blogsCount: blogsCountSubquery,
        })
        .from(blogTags)
        .leftJoin(createdByUser, eq(blogTags.createdBy, createdByUser.id))
        .leftJoin(deletedByUser, eq(blogTags.deletedBy, deletedByUser.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(blogTags)
        .where(whereClause),
    ]);

    return {
      data: tags,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const createdByUser = alias(adminUsers, 'created_by_user');
    const deletedByUser = alias(adminUsers, 'deleted_by_user');

    const [tag] = await this.drizzle.db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
        sortOrder: blogTags.sortOrder,
        status: blogTags.status,
        excerpt: blogTags.excerpt,
        createdBy: blogTags.createdBy,
        createdByName: createdByUser.fullName,
        deletedAt: blogTags.deletedAt,
        deletedReason: blogTags.deletedReason,
        deletedBy: blogTags.deletedBy,
        deletedByName: deletedByUser.fullName,
        createdAt: blogTags.createdAt,
        updatedAt: blogTags.updatedAt,
      })
      .from(blogTags)
      .leftJoin(createdByUser, eq(blogTags.createdBy, createdByUser.id))
      .leftJoin(deletedByUser, eq(blogTags.deletedBy, deletedByUser.id))
      .where(eq(blogTags.id, id))
      .limit(1);

    if (!tag) throw new NotFoundException('Blog tag not found');
    return tag;
  }

  async create(dto: CreateBlogTagDto, createdById?: string) {
    const slug = dto.slug ?? generateSlug(dto.name);

    const [existingSlug] = await this.drizzle.db
      .select()
      .from(blogTags)
      .where(eq(blogTags.slug, slug))
      .limit(1);

    if (existingSlug) throw new ConflictException('Slug already in use');

    const [existingName] = await this.drizzle.db
      .select()
      .from(blogTags)
      .where(eq(blogTags.name, dto.name))
      .limit(1);

    if (existingName) throw new ConflictException('Tag name already in use');

    const [tag] = await this.drizzle.db
      .insert(blogTags)
      .values({
        name: dto.name,
        slug,
        sortOrder: dto.sortOrder ?? 0,
        status: dto.status ?? 'draft',
        excerpt: dto.excerpt,
        createdBy: createdById,
      })
      .returning();

    const result = await this.findOne(tag.id);
    this.revalidationService.revalidate([
      'blog-tags',
      `blog-tag-${result.slug}`,
    ]);
    return result;
  }

  async update(id: string, dto: UpdateBlogTagDto) {
    const [existing] = await this.drizzle.db
      .select()
      .from(blogTags)
      .where(eq(blogTags.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException('Blog tag not found');
    if (existing.deletedAt)
      throw new BadRequestException('Cannot update a deleted tag');

    if (dto.slug && dto.slug !== existing.slug) {
      const [slugConflict] = await this.drizzle.db
        .select()
        .from(blogTags)
        .where(and(eq(blogTags.slug, dto.slug), ne(blogTags.id, id)))
        .limit(1);

      if (slugConflict) throw new ConflictException('Slug already in use');
    }

    if (dto.name && dto.name !== existing.name) {
      const [nameConflict] = await this.drizzle.db
        .select()
        .from(blogTags)
        .where(and(eq(blogTags.name, dto.name), ne(blogTags.id, id)))
        .limit(1);

      if (nameConflict) throw new ConflictException('Tag name already in use');
    }

    await this.drizzle.db
      .update(blogTags)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(blogTags.id, id));

    const result = await this.findOne(id);
    this.revalidationService.revalidate([
      'blog-tags',
      `blog-tag-${result.slug}`,
    ]);
    return result;
  }

  async softDelete(id: string, reason: string, deletedById?: string) {
    const [tag] = await this.drizzle.db
      .select()
      .from(blogTags)
      .where(eq(blogTags.id, id))
      .limit(1);

    if (!tag) throw new NotFoundException('Blog tag not found');
    if (tag.deletedAt) throw new BadRequestException('Tag is already deleted');

    await this.drizzle.db
      .update(blogTags)
      .set({
        deletedAt: new Date(),
        deletedReason: reason,
        deletedBy: deletedById,
        updatedAt: new Date(),
      })
      .where(eq(blogTags.id, id));

    this.revalidationService.revalidate(['blog-tags', `blog-tag-${tag.slug}`]);
    return { message: 'Blog tag deleted' };
  }

  async restore(id: string) {
    const [tag] = await this.drizzle.db
      .select()
      .from(blogTags)
      .where(eq(blogTags.id, id))
      .limit(1);

    if (!tag) throw new NotFoundException('Blog tag not found');
    if (!tag.deletedAt) throw new BadRequestException('Tag is not deleted');

    await this.drizzle.db
      .update(blogTags)
      .set({
        deletedAt: null,
        deletedReason: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(blogTags.id, id));

    this.revalidationService.revalidate(['blog-tags', `blog-tag-${tag.slug}`]);
    return { message: 'Blog tag restored' };
  }

  async permanentDelete(id: string) {
    const [tag] = await this.drizzle.db
      .select()
      .from(blogTags)
      .where(eq(blogTags.id, id))
      .limit(1);

    if (!tag) throw new NotFoundException('Blog tag not found');
    if (!tag.deletedAt)
      throw new BadRequestException(
        'Tag must be soft-deleted before permanent deletion',
      );

    await this.drizzle.db.delete(blogTags).where(eq(blogTags.id, id));

    this.revalidationService.revalidate(['blog-tags', `blog-tag-${tag.slug}`]);
    return { message: 'Blog tag permanently deleted' };
  }

  async revalidateOne(id: string): Promise<{ revalidated: boolean }> {
    const [row] = await this.drizzle.db
      .select({ slug: blogTags.slug })
      .from(blogTags)
      .where(eq(blogTags.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Blog tag not found');
    this.revalidationService.revalidate(['blog-tags', `blog-tag-${row.slug}`]);
    return { revalidated: true };
  }

  revalidateAll(): { revalidated: boolean } {
    this.revalidationService.revalidate(['blog-tags']);
    return { revalidated: true };
  }
}
