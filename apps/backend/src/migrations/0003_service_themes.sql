CREATE TABLE "service_themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_themes" ADD CONSTRAINT "service_themes_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_themes" ADD CONSTRAINT "service_themes_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_media" ADD COLUMN "theme_id" uuid;--> statement-breakpoint
ALTER TABLE "service_media" ADD CONSTRAINT "service_media_theme_id_service_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."service_themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_videos" ADD COLUMN "theme_id" uuid;--> statement-breakpoint
ALTER TABLE "service_videos" ADD CONSTRAINT "service_videos_theme_id_service_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."service_themes"("id") ON DELETE cascade ON UPDATE no action;
