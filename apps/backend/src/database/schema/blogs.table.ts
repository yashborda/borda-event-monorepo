import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { adminUsers } from './admin-users.table';
import { blogAuthors } from './blog-authors.table';
import { mediaFiles } from './media-files.table';
import { blogPublishStatusEnum, robotsDirectiveEnum } from './blog-enums';

export const blogs = pgTable('blogs', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  authorId: uuid('author_id').references(() => blogAuthors.id, {
    onDelete: 'set null',
  }),
  featuredImageId: uuid('featured_image_id').references(() => mediaFiles.id, {
    onDelete: 'set null',
  }),
  featuredImageAlt: text('featured_image_alt'),
  status: blogPublishStatusEnum('status').default('draft').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  readingTime: integer('reading_time').default(0).notNull(),
  // SEO
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  canonicalUrl: text('canonical_url'),
  // Open Graph
  ogTitle: varchar('og_title', { length: 255 }),
  ogDescription: text('og_description'),
  ogImageId: uuid('og_image_id').references(() => mediaFiles.id, {
    onDelete: 'set null',
  }),
  // Twitter
  twitterTitle: varchar('twitter_title', { length: 255 }),
  twitterDescription: text('twitter_description'),
  twitterImageId: uuid('twitter_image_id').references(() => mediaFiles.id, {
    onDelete: 'set null',
  }),
  // Robots
  robots: robotsDirectiveEnum('robots').default('index').notNull(),
  googlebot: robotsDirectiveEnum('googlebot').default('index').notNull(),
  // Audit
  createdBy: uuid('created_by').references(() => adminUsers.id, {
    onDelete: 'set null',
  }),
  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedReason: text('deleted_reason'),
  deletedBy: uuid('deleted_by').references(() => adminUsers.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type BlogRow = typeof blogs.$inferSelect;
export type NewBlogRow = typeof blogs.$inferInsert;
