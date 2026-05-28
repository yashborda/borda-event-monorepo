import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { adminUsers } from './admin-users.table';
import { blogStatusEnum } from './blog-enums';

export const blogTags = pgTable('blog_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  status: blogStatusEnum('status').default('draft').notNull(),
  excerpt: text('excerpt'),
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

export type BlogTagRow = typeof blogTags.$inferSelect;
export type NewBlogTagRow = typeof blogTags.$inferInsert;
