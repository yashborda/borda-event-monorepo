import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  uuid,
} from 'drizzle-orm/pg-core';

import { mediaFiles } from './media-files.table';
import { services } from './services.table';
import { serviceThemes } from './service-themes.table';

export const serviceMedia = pgTable(
  'service_media',
  {
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => mediaFiles.id, { onDelete: 'cascade' }),
    themeId: uuid('theme_id').references(() => serviceThemes.id, {
      onDelete: 'cascade',
    }),
    isFeatured: boolean('is_featured').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.serviceId, t.mediaId] })],
);

export type ServiceMediaRow = typeof serviceMedia.$inferSelect;
