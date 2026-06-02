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
import { mediaFiles } from './media-files.table';

export const catalogues = pgTable('catalogues', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  coverImageId: uuid('cover_image_id').references(() => mediaFiles.id, {
    onDelete: 'set null',
  }),
  isPublic: boolean('is_public').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
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

export type CatalogueRow = typeof catalogues.$inferSelect;
export type NewCatalogueRow = typeof catalogues.$inferInsert;
