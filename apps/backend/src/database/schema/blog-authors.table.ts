import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { adminUsers } from './admin-users.table';
import { mediaFiles } from './media-files.table';

export const blogAuthors = pgTable('blog_authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  avatarId: uuid('avatar_id').references(() => mediaFiles.id, {
    onDelete: 'set null',
  }),
  bio: text('bio'),
  designation: varchar('designation', { length: 255 }),
  // Social
  website: text('website'),
  twitter: text('twitter'),
  linkedin: text('linkedin'),
  instagram: text('instagram'),
  // Status
  status: varchar('status', { length: 20 }).default('active').notNull(),
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

export type BlogAuthorRow = typeof blogAuthors.$inferSelect;
export type NewBlogAuthorRow = typeof blogAuthors.$inferInsert;
