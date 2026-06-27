import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { services } from './services.table';
import { serviceThemes } from './service-themes.table';

/**
 * Many-to-many link between services and themes: a single theme (with its
 * photos/videos) can be surfaced under multiple services without duplicating
 * its media in storage. `sortOrder` is per-service — the same theme can sit in
 * a different position in each service it belongs to.
 *
 * Phase 1 (additive) introduces this alongside the legacy
 * `serviceThemes.serviceId` column, which still drives the backend until the
 * Phase 2 query rewrite removes it.
 */
export const serviceThemeLinks = pgTable(
  'service_theme_links',
  {
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    themeId: uuid('theme_id')
      .notNull()
      .references(() => serviceThemes.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.serviceId, t.themeId] })],
);

export type ServiceThemeLinkRow = typeof serviceThemeLinks.$inferSelect;
export type NewServiceThemeLinkRow = typeof serviceThemeLinks.$inferInsert;
