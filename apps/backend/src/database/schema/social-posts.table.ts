import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { adminUsers } from './admin-users.table';
import { mediaFiles } from './media-files.table';
import { socialPlatformEnum } from './event-enums';

export const socialPosts = pgTable('social_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: socialPlatformEnum('platform').notNull(),
  postUrl: text('post_url').notNull(),
  thumbnailId: uuid('thumbnail_id').references(() => mediaFiles.id, {
    onDelete: 'set null',
  }),
  caption: text('caption'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
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
});

export type SocialPostRow = typeof socialPosts.$inferSelect;
export type NewSocialPostRow = typeof socialPosts.$inferInsert;
