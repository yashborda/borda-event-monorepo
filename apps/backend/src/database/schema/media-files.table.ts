import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const mediaFiles = pgTable('media_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').unique().notNull(),
  folder: text('folder').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type MediaFileRow = typeof mediaFiles.$inferSelect;
export type NewMediaFileRow = typeof mediaFiles.$inferInsert;
