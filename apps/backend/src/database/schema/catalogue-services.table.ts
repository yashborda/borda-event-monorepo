import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { catalogues } from './catalogues.table';
import { services } from './services.table';

export const catalogueServices = pgTable(
  'catalogue_services',
  {
    catalogueId: uuid('catalogue_id')
      .notNull()
      .references(() => catalogues.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.catalogueId, t.serviceId] })],
);

export type CatalogueServiceRow = typeof catalogueServices.$inferSelect;
