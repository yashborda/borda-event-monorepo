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
import { services } from './services.table';
import { serviceThemes } from './service-themes.table';
import { serviceVideoTypeEnum } from './event-enums';

export const serviceVideos = pgTable('service_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id')
    .notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  themeId: uuid('theme_id').references(() => serviceThemes.id, {
    onDelete: 'cascade',
  }),
  type: serviceVideoTypeEnum('type').notNull(),
  // Human-friendly name shown in admin lists; for drive videos it is mirrored
  // to the Drive file name on rename so the user's Drive stays organised.
  title: varchar('title', { length: 255 }),
  instagramUrl: text('instagram_url'),
  driveFileId: varchar('drive_file_id', { length: 500 }),
  driveUrl: text('drive_url'),
  thumbnailId: uuid('thumbnail_id').references(() => mediaFiles.id, {
    onDelete: 'set null',
  }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdBy: uuid('created_by').references(() => adminUsers.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ServiceVideoRow = typeof serviceVideos.$inferSelect;
export type NewServiceVideoRow = typeof serviceVideos.$inferInsert;
