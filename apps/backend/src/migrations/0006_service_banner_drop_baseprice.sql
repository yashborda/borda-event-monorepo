ALTER TABLE "services" ADD COLUMN "banner_image_id" uuid;
--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_banner_image_id_media_files_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media_files"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "base_price";
