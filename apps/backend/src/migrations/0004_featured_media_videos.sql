ALTER TABLE "service_media" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "service_videos" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "service_media_one_featured_per_theme" ON "service_media" ("theme_id") WHERE "is_featured" = true AND "theme_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "service_videos_one_featured_per_theme" ON "service_videos" ("theme_id") WHERE "is_featured" = true AND "theme_id" IS NOT NULL;
