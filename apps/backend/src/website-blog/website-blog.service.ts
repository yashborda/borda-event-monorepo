import { Injectable, NotFoundException } from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  sql,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DrizzleService } from '../database/drizzle.service.js';
import { blogAuthors } from '../database/schema/blog-authors.table.js';
import { blogCategories } from '../database/schema/blog-categories.table.js';
import { blogCategoryRelations } from '../database/schema/blog-category-relations.table.js';
import { blogTagRelations } from '../database/schema/blog-tag-relations.table.js';
import { blogTags } from '../database/schema/blog-tags.table.js';
import { blogs } from '../database/schema/blogs.table.js';
import { mediaFiles } from '../database/schema/media-files.table.js';

const featuredImageFile = alias(mediaFiles, 'featured_image_file');
const authorAvatarFile = alias(mediaFiles, 'author_avatar_file');

@Injectable()
export class WebsiteBlogService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getBlogs(
    page = 1,
    limit = 20,
    search?: string,
    categorySlug?: string,
    tagSlug?: string,
    authorSlug?: string,
  ) {
    const offset = (page - 1) * limit;

    const conditions = [eq(blogs.status, 'published'), isNull(blogs.deletedAt)];

    if (search) {
      conditions.push(ilike(blogs.title, `%${search}%`));
    }

    if (authorSlug) {
      conditions.push(eq(blogAuthors.slug, authorSlug));
    }

    // Build category subquery filter if needed
    let categoryFilterIds: string[] | undefined;
    if (categorySlug) {
      const catRows = await this.drizzle.db
        .select({ id: blogCategories.id })
        .from(blogCategories)
        .where(
          and(
            eq(blogCategories.slug, categorySlug),
            eq(blogCategories.status, 'published'),
          ),
        )
        .limit(1);

      if (catRows.length === 0) {
        return { data: [], total: 0, page, limit };
      }

      const catId = catRows[0].id;
      const relRows = await this.drizzle.db
        .select({ blogId: blogCategoryRelations.blogId })
        .from(blogCategoryRelations)
        .where(eq(blogCategoryRelations.categoryId, catId));

      categoryFilterIds = relRows.map((r) => r.blogId);
      if (categoryFilterIds.length === 0) {
        return { data: [], total: 0, page, limit };
      }
    }

    // Build tag subquery filter if needed
    let tagFilterIds: string[] | undefined;
    if (tagSlug) {
      const tagRows = await this.drizzle.db
        .select({ id: blogTags.id })
        .from(blogTags)
        .where(eq(blogTags.slug, tagSlug))
        .limit(1);

      if (tagRows.length === 0) {
        return { data: [], total: 0, page, limit };
      }

      const tagId = tagRows[0].id;
      const relRows = await this.drizzle.db
        .select({ blogId: blogTagRelations.blogId })
        .from(blogTagRelations)
        .where(eq(blogTagRelations.tagId, tagId));

      tagFilterIds = relRows.map((r) => r.blogId);
      if (tagFilterIds.length === 0) {
        return { data: [], total: 0, page, limit };
      }
    }

    // Build final conditions with ID filters
    const finalConditions = [...conditions];
    if (categoryFilterIds) {
      finalConditions.push(
        inArray(blogs.id, categoryFilterIds) as unknown as ReturnType<
          typeof eq
        >,
      );
    }
    if (tagFilterIds) {
      finalConditions.push(
        inArray(blogs.id, tagFilterIds) as unknown as ReturnType<typeof eq>,
      );
    }

    const finalWhere = and(
      ...(finalConditions as [
        ReturnType<typeof eq>,
        ...ReturnType<typeof eq>[],
      ]),
    );

    const [rows, [{ total }]] = await Promise.all([
      this.drizzle.db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          excerpt: blogs.excerpt,
          featuredImageAlt: blogs.featuredImageAlt,
          status: blogs.status,
          publishedAt: blogs.publishedAt,
          readingTime: blogs.readingTime,
          viewCount: blogs.viewCount,
          likeCount: blogs.likeCount,
          isFeatured: blogs.isFeatured,
          authorId: blogs.authorId,
          authorFullName: blogAuthors.fullName,
          authorSlug: blogAuthors.slug,
          featuredImageId: featuredImageFile.id,
          featuredImageUrl: featuredImageFile.url,
          featuredImageFolder: featuredImageFile.folder,
          featuredImageOriginalName: featuredImageFile.originalName,
          featuredImageMimeType: featuredImageFile.mimeType,
          featuredImageSize: featuredImageFile.size,
          authorAvatarId: authorAvatarFile.id,
          authorAvatarUrl: authorAvatarFile.url,
          authorAvatarFolder: authorAvatarFile.folder,
          authorAvatarOriginalName: authorAvatarFile.originalName,
          authorAvatarMimeType: authorAvatarFile.mimeType,
          authorAvatarSize: authorAvatarFile.size,
        })
        .from(blogs)
        .leftJoin(blogAuthors, eq(blogs.authorId, blogAuthors.id))
        .leftJoin(
          featuredImageFile,
          eq(blogs.featuredImageId, featuredImageFile.id),
        )
        .leftJoin(
          authorAvatarFile,
          eq(blogAuthors.avatarId, authorAvatarFile.id),
        )
        .where(finalWhere)
        .orderBy(desc(blogs.publishedAt))
        .limit(limit)
        .offset(offset),
      this.drizzle.db
        .select({ total: count() })
        .from(blogs)
        .leftJoin(blogAuthors, eq(blogs.authorId, blogAuthors.id))
        .where(finalWhere),
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
      if (!categoriesByBlog.has(row.blogId))
        categoriesByBlog.set(row.blogId, []);
      categoriesByBlog
        .get(row.blogId)!
        .push({ id: row.id, categoryName: row.categoryName, slug: row.slug });
    }

    const tagsByBlog = new Map<
      string,
      { id: string; name: string; slug: string }[]
    >();
    for (const row of tagRows) {
      if (!tagsByBlog.has(row.blogId)) tagsByBlog.set(row.blogId, []);
      tagsByBlog
        .get(row.blogId)!
        .push({ id: row.id, name: row.name, slug: row.slug });
    }

    const data = rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      featuredImage: row.featuredImageId
        ? {
            id: row.featuredImageId,
            url: row.featuredImageUrl!,
            folder: row.featuredImageFolder!,
            originalName: row.featuredImageOriginalName!,
            mimeType: row.featuredImageMimeType!,
            size: row.featuredImageSize!,
          }
        : null,
      featuredImageAlt: row.featuredImageAlt,
      status: row.status,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      readingTime: row.readingTime,
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      isFeatured: row.isFeatured,
      author: row.authorId
        ? {
            id: row.authorId,
            fullName: row.authorFullName,
            slug: row.authorSlug,
            avatar: row.authorAvatarId
              ? {
                  id: row.authorAvatarId,
                  url: row.authorAvatarUrl!,
                  folder: row.authorAvatarFolder!,
                  originalName: row.authorAvatarOriginalName!,
                  mimeType: row.authorAvatarMimeType!,
                  size: row.authorAvatarSize!,
                }
              : null,
          }
        : null,
      categories: categoriesByBlog.get(row.id) ?? [],
      tags: tagsByBlog.get(row.id) ?? [],
    }));

    return { data, total, page, limit };
  }

  async getBlogBySlug(slug: string) {
    const ogImageFile = alias(mediaFiles, 'og_image_file');
    const twitterImageFile = alias(mediaFiles, 'twitter_image_file');

    const [row] = await this.drizzle.db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        excerpt: blogs.excerpt,
        content: blogs.content,
        featuredImageAlt: blogs.featuredImageAlt,
        status: blogs.status,
        publishedAt: blogs.publishedAt,
        readingTime: blogs.readingTime,
        viewCount: blogs.viewCount,
        likeCount: blogs.likeCount,
        isFeatured: blogs.isFeatured,
        metaTitle: blogs.metaTitle,
        metaDescription: blogs.metaDescription,
        metaKeywords: blogs.metaKeywords,
        canonicalUrl: blogs.canonicalUrl,
        ogTitle: blogs.ogTitle,
        ogDescription: blogs.ogDescription,
        twitterTitle: blogs.twitterTitle,
        twitterDescription: blogs.twitterDescription,
        robots: blogs.robots,
        googlebot: blogs.googlebot,
        authorId: blogs.authorId,
        authorFullName: blogAuthors.fullName,
        authorSlug: blogAuthors.slug,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        featuredImageId: featuredImageFile.id,
        featuredImageUrl: featuredImageFile.url,
        featuredImageFolder: featuredImageFile.folder,
        featuredImageOriginalName: featuredImageFile.originalName,
        featuredImageMimeType: featuredImageFile.mimeType,
        featuredImageSize: featuredImageFile.size,
        authorAvatarId: authorAvatarFile.id,
        authorAvatarUrl: authorAvatarFile.url,
        authorAvatarFolder: authorAvatarFile.folder,
        authorAvatarOriginalName: authorAvatarFile.originalName,
        authorAvatarMimeType: authorAvatarFile.mimeType,
        authorAvatarSize: authorAvatarFile.size,
        ogImageId: ogImageFile.id,
        ogImageUrl: ogImageFile.url,
        ogImageFolder: ogImageFile.folder,
        ogImageOriginalName: ogImageFile.originalName,
        ogImageMimeType: ogImageFile.mimeType,
        ogImageSize: ogImageFile.size,
        twitterImageId: twitterImageFile.id,
        twitterImageUrl: twitterImageFile.url,
        twitterImageFolder: twitterImageFile.folder,
        twitterImageOriginalName: twitterImageFile.originalName,
        twitterImageMimeType: twitterImageFile.mimeType,
        twitterImageSize: twitterImageFile.size,
      })
      .from(blogs)
      .leftJoin(blogAuthors, eq(blogs.authorId, blogAuthors.id))
      .leftJoin(
        featuredImageFile,
        eq(blogs.featuredImageId, featuredImageFile.id),
      )
      .leftJoin(authorAvatarFile, eq(blogAuthors.avatarId, authorAvatarFile.id))
      .leftJoin(ogImageFile, eq(blogs.ogImageId, ogImageFile.id))
      .leftJoin(twitterImageFile, eq(blogs.twitterImageId, twitterImageFile.id))
      .where(
        and(
          eq(blogs.slug, slug),
          eq(blogs.status, 'published'),
          isNull(blogs.deletedAt),
        ),
      )
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
        .where(eq(blogCategoryRelations.blogId, row.id)),
      this.drizzle.db
        .select({
          id: blogTags.id,
          name: blogTags.name,
          slug: blogTags.slug,
        })
        .from(blogTagRelations)
        .innerJoin(blogTags, eq(blogTagRelations.tagId, blogTags.id))
        .where(eq(blogTagRelations.blogId, row.id)),
    ]);

    // Fire-and-forget view count increment
    void this.incrementViewCount(row.id);

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      featuredImage: row.featuredImageId
        ? {
            id: row.featuredImageId,
            url: row.featuredImageUrl!,
            folder: row.featuredImageFolder!,
            originalName: row.featuredImageOriginalName!,
            mimeType: row.featuredImageMimeType!,
            size: row.featuredImageSize!,
          }
        : null,
      featuredImageAlt: row.featuredImageAlt,
      status: row.status,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      readingTime: row.readingTime,
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      isFeatured: row.isFeatured,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      metaKeywords: row.metaKeywords,
      canonicalUrl: row.canonicalUrl,
      ogTitle: row.ogTitle,
      ogDescription: row.ogDescription,
      ogImage: row.ogImageId
        ? {
            id: row.ogImageId,
            url: row.ogImageUrl!,
            folder: row.ogImageFolder!,
            originalName: row.ogImageOriginalName!,
            mimeType: row.ogImageMimeType!,
            size: row.ogImageSize!,
          }
        : null,
      twitterTitle: row.twitterTitle,
      twitterDescription: row.twitterDescription,
      twitterImage: row.twitterImageId
        ? {
            id: row.twitterImageId,
            url: row.twitterImageUrl!,
            folder: row.twitterImageFolder!,
            originalName: row.twitterImageOriginalName!,
            mimeType: row.twitterImageMimeType!,
            size: row.twitterImageSize!,
          }
        : null,
      robots: row.robots,
      googlebot: row.googlebot,
      author: row.authorId
        ? {
            id: row.authorId,
            fullName: row.authorFullName,
            slug: row.authorSlug,
            avatar: row.authorAvatarId
              ? {
                  id: row.authorAvatarId,
                  url: row.authorAvatarUrl!,
                  folder: row.authorAvatarFolder!,
                  originalName: row.authorAvatarOriginalName!,
                  mimeType: row.authorAvatarMimeType!,
                  size: row.authorAvatarSize!,
                }
              : null,
          }
        : null,
      categories: categoryRows,
      tags: tagRows,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private async incrementViewCount(blogId: string): Promise<void> {
    await this.drizzle.db
      .update(blogs)
      .set({ viewCount: sql`${blogs.viewCount} + 1` })
      .where(eq(blogs.id, blogId));
  }

  async getCategories() {
    const blogsCountSubquery = sql<number>`(
      SELECT COUNT(*)::int
      FROM blog_category_relations bcr
      INNER JOIN blogs b ON bcr.blog_id = b.id
      WHERE bcr.category_id = ${blogCategories.id}
        AND b.status = 'published'
        AND b.deleted_at IS NULL
    )`;

    const rows = await this.drizzle.db
      .select({
        id: blogCategories.id,
        categoryName: blogCategories.categoryName,
        slug: blogCategories.slug,
        bannerImageId: blogCategories.bannerImageId,
        sortOrder: blogCategories.sortOrder,
        blogsCount: blogsCountSubquery,
      })
      .from(blogCategories)
      .where(eq(blogCategories.status, 'published'))
      .orderBy(asc(blogCategories.sortOrder), asc(blogCategories.categoryName));

    return rows;
  }

  async getCategoryWithBlogs(slug: string, page = 1, limit = 20) {
    const bannerImageFile = alias(mediaFiles, 'category_banner_image_file');
    const ogImageFile = alias(mediaFiles, 'category_og_image_file');
    const twitterImageFile = alias(mediaFiles, 'category_twitter_image_file');

    const [row] = await this.drizzle.db
      .select({
        id: blogCategories.id,
        categoryName: blogCategories.categoryName,
        slug: blogCategories.slug,
        sortOrder: blogCategories.sortOrder,
        excerpt: blogCategories.excerpt,
        bannerImageId: blogCategories.bannerImageId,
        bannerImageUrl: bannerImageFile.url,
        bannerImageFolder: bannerImageFile.folder,
        bannerImageOriginalName: bannerImageFile.originalName,
        bannerImageMimeType: bannerImageFile.mimeType,
        bannerImageSize: bannerImageFile.size,
        metaTitle: blogCategories.metaTitle,
        metaDescription: blogCategories.metaDescription,
        metaKeywords: blogCategories.metaKeywords,
        canonicalUrl: blogCategories.canonicalUrl,
        ogTitle: blogCategories.ogTitle,
        ogDescription: blogCategories.ogDescription,
        ogImageId: blogCategories.ogImageId,
        ogImageUrl: ogImageFile.url,
        ogImageFolder: ogImageFile.folder,
        ogImageOriginalName: ogImageFile.originalName,
        ogImageMimeType: ogImageFile.mimeType,
        ogImageSize: ogImageFile.size,
        twitterTitle: blogCategories.twitterTitle,
        twitterDescription: blogCategories.twitterDescription,
        twitterImageId: blogCategories.twitterImageId,
        twitterImageUrl: twitterImageFile.url,
        twitterImageFolder: twitterImageFile.folder,
        twitterImageOriginalName: twitterImageFile.originalName,
        twitterImageMimeType: twitterImageFile.mimeType,
        twitterImageSize: twitterImageFile.size,
        robots: blogCategories.robots,
        googlebot: blogCategories.googlebot,
        createdAt: blogCategories.createdAt,
        updatedAt: blogCategories.updatedAt,
      })
      .from(blogCategories)
      .leftJoin(
        bannerImageFile,
        eq(blogCategories.bannerImageId, bannerImageFile.id),
      )
      .leftJoin(ogImageFile, eq(blogCategories.ogImageId, ogImageFile.id))
      .leftJoin(
        twitterImageFile,
        eq(blogCategories.twitterImageId, twitterImageFile.id),
      )
      .where(
        and(
          eq(blogCategories.slug, slug),
          eq(blogCategories.status, 'published'),
        ),
      )
      .limit(1);

    if (!row) throw new NotFoundException('Blog category not found');

    const category = {
      id: row.id,
      categoryName: row.categoryName,
      slug: row.slug,
      sortOrder: row.sortOrder,
      excerpt: row.excerpt,
      bannerImage: row.bannerImageId
        ? {
            id: row.bannerImageId,
            url: row.bannerImageUrl!,
            folder: row.bannerImageFolder!,
            originalName: row.bannerImageOriginalName!,
            mimeType: row.bannerImageMimeType!,
            size: row.bannerImageSize!,
          }
        : null,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      metaKeywords: row.metaKeywords,
      canonicalUrl: row.canonicalUrl,
      ogTitle: row.ogTitle,
      ogDescription: row.ogDescription,
      ogImage: row.ogImageId
        ? {
            id: row.ogImageId,
            url: row.ogImageUrl!,
            folder: row.ogImageFolder!,
            originalName: row.ogImageOriginalName!,
            mimeType: row.ogImageMimeType!,
            size: row.ogImageSize!,
          }
        : null,
      twitterTitle: row.twitterTitle,
      twitterDescription: row.twitterDescription,
      twitterImage: row.twitterImageId
        ? {
            id: row.twitterImageId,
            url: row.twitterImageUrl!,
            folder: row.twitterImageFolder!,
            originalName: row.twitterImageOriginalName!,
            mimeType: row.twitterImageMimeType!,
            size: row.twitterImageSize!,
          }
        : null,
      robots: row.robots,
      googlebot: row.googlebot,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    const paginatedBlogs = await this.getBlogs(page, limit, undefined, slug);

    return { category, blogs: paginatedBlogs };
  }

  async getAuthorWithBlogs(slug: string, page = 1, limit = 9) {
    const [row] = await this.drizzle.db
      .select({
        id: blogAuthors.id,
        fullName: blogAuthors.fullName,
        slug: blogAuthors.slug,
        bio: blogAuthors.bio,
        designation: blogAuthors.designation,
        website: blogAuthors.website,
        twitter: blogAuthors.twitter,
        linkedin: blogAuthors.linkedin,
        instagram: blogAuthors.instagram,
        avatarUrl: authorAvatarFile.url,
      })
      .from(blogAuthors)
      .leftJoin(authorAvatarFile, eq(blogAuthors.avatarId, authorAvatarFile.id))
      .where(
        and(
          eq(blogAuthors.slug, slug),
          eq(blogAuthors.status, 'active'),
          isNull(blogAuthors.deletedAt),
        ),
      )
      .limit(1);

    if (!row) throw new NotFoundException('Author not found');

    const author = {
      id: row.id,
      fullName: row.fullName,
      slug: row.slug,
      bio: row.bio,
      designation: row.designation,
      website: row.website,
      twitter: row.twitter,
      linkedin: row.linkedin,
      instagram: row.instagram,
      avatar: row.avatarUrl ? { url: row.avatarUrl } : null,
    };

    const paginatedBlogs = await this.getBlogs(
      page,
      limit,
      undefined,
      undefined,
      undefined,
      slug,
    );

    return { author, blogs: paginatedBlogs };
  }

  async getAuthorSlugsForStaticParams() {
    const rows = await this.drizzle.db
      .select({ slug: blogAuthors.slug })
      .from(blogAuthors)
      .where(
        and(eq(blogAuthors.status, 'active'), isNull(blogAuthors.deletedAt)),
      );

    return rows.map((r) => ({ slug: r.slug }));
  }

  async getTagWithBlogs(slug: string, page = 1, limit = 9) {
    const [tag] = await this.drizzle.db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
        excerpt: blogTags.excerpt,
      })
      .from(blogTags)
      .where(
        and(
          eq(blogTags.slug, slug),
          eq(blogTags.status, 'published'),
          isNull(blogTags.deletedAt),
        ),
      )
      .limit(1);

    if (!tag) throw new NotFoundException('Tag not found');

    const paginatedBlogs = await this.getBlogs(
      page,
      limit,
      undefined,
      undefined,
      slug,
    );

    return { tag, blogs: paginatedBlogs };
  }

  async getTagSlugsForStaticParams() {
    const rows = await this.drizzle.db
      .select({ slug: blogTags.slug })
      .from(blogTags)
      .where(and(eq(blogTags.status, 'published'), isNull(blogTags.deletedAt)));

    return rows.map((r) => ({ slug: r.slug }));
  }

  async getSlugsForStaticParams() {
    const rows = await this.drizzle.db
      .select({ slug: blogs.slug })
      .from(blogs)
      .where(and(eq(blogs.status, 'published'), isNull(blogs.deletedAt)));

    return rows.map((r) => ({ slug: r.slug }));
  }

  async getCategorySlugsForStaticParams() {
    const rows = await this.drizzle.db
      .select({ slug: blogCategories.slug })
      .from(blogCategories)
      .where(eq(blogCategories.status, 'published'));

    return rows.map((r) => ({ slug: r.slug }));
  }
}
