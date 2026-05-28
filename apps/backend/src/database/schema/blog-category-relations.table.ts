import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { blogCategories } from './blog-categories.table';
import { blogs } from './blogs.table';

export const blogCategoryRelations = pgTable(
  'blog_category_relations',
  {
    blogId: uuid('blog_id')
      .notNull()
      .references(() => blogs.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => blogCategories.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.blogId, t.categoryId] })],
);

export type BlogCategoryRelationRow = typeof blogCategoryRelations.$inferSelect;
