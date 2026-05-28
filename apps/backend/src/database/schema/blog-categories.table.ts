import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { adminUsers } from './admin-users.table';
import { mediaFiles } from './media-files.table';
import { blogStatusEnum, robotsDirectiveEnum } from './blog-enums';

export const blogCategories = pgTable('blog_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryName: varchar('category_name', { length: 255 }).unique().notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  status: blogStatusEnum('status').default('draft').notNull(),
  bannerImageId: uuid('banner_image_id').references(() => mediaFiles.id, {
    onDelete: 'set null',
  }),
  sortOrder: integer('sort_order').default(0).notNull(),
  excerpt: text('excerpt'),
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
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedReason: text('deleted_reason'),
  deletedBy: uuid('deleted_by').references(() => adminUsers.id, {
    onDelete: 'set null',
  }),
});

export type BlogCategoryRow = typeof blogCategories.$inferSelect;
export type NewBlogCategoryRow = typeof blogCategories.$inferInsert;
