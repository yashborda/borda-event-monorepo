CREATE TYPE "public"."service_video_type" AS ENUM('instagram', 'drive');--> statement-breakpoint
CREATE TABLE "service_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"type" "service_video_type" NOT NULL,
	"instagram_url" text,
	"drive_file_id" varchar(500),
	"drive_url" text,
	"thumbnail_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_videos" ADD CONSTRAINT "service_videos_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_videos" ADD CONSTRAINT "service_videos_thumbnail_id_media_files_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_videos" ADD CONSTRAINT "service_videos_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;