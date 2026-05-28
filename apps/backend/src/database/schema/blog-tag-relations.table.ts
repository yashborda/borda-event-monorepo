import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { blogTags } from './blog-tags.table';
import { blogs } from './blogs.table';

export const blogTagRelations = pgTable(
  'blog_tag_relations',
  {
    blogId: uuid('blog_id')
      .notNull()
      .references(() => blogs.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => blogTags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.blogId, t.tagId] })],
);

export type BlogTagRelationRow = typeof blogTagRelations.$inferSelect;
