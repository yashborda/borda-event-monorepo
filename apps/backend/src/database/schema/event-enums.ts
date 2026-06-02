import { pgEnum } from 'drizzle-orm/pg-core';

export const billStatusEnum = pgEnum('bill_status', [
  'draft',
  'confirmed',
  'completed',
  'cancelled',
]);
export const inquiryStatusEnum = pgEnum('inquiry_status', [
  'new',
  'contacted',
  'booked',
  'lost',
]);
export const socialPlatformEnum = pgEnum('social_platform', [
  'instagram',
  'facebook',
  'youtube',
]);
