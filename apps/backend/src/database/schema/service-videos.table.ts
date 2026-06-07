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
import { services } from './services.table';
import { serviceVideoTypeEnum } from './event-enums';

export const serviceVideos = pgTable('service_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id')
    .notNull()
    .references(() => services.id, { onDelete: 'cascade' }),
  type: serviceVideoTypeEnum('type').notNull(),
  instagramUrl: text('instagram_url'),
  driveFileId: varchar('drive_file_id', { length: 500 }),
  driveUrl: text('drive_url'),
  thumbnailId: uuid('thumbnail_id').references(() => mediaFiles.id, {
    onDelete: 'set null',
  }),
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
