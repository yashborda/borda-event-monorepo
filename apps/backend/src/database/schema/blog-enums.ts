import { pgEnum } from 'drizzle-orm/pg-core';

export const blogStatusEnum = pgEnum('blog_status', ['draft', 'published']);
export const blogPublishStatusEnum = pgEnum('blog_publish_status', [
  'draft',
  'scheduled',
  'published',
]);
export const robotsDirectiveEnum = pgEnum('robots_directive', [
  'index',
  'noindex',
]);
