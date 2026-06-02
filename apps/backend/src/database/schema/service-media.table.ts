import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { mediaFiles } from './media-files.table';
import { services } from './services.table';

export const serviceMedia = pgTable(
  'service_media',
  {
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => mediaFiles.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.serviceId, t.mediaId] })],
);

export type ServiceMediaRow = typeof serviceMedia.$inferSelect;
