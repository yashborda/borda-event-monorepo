CREATE TABLE "service_theme_links" (
	"service_id" uuid NOT NULL,
	"theme_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "service_theme_links_service_id_theme_id_pk" PRIMARY KEY("service_id","theme_id")
);
--> statement-breakpoint
ALTER TABLE "service_theme_links" ADD CONSTRAINT "service_theme_links_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "service_theme_links" ADD CONSTRAINT "service_theme_links_theme_id_service_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."service_themes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "service_theme_links" ("service_id", "theme_id", "sort_order")
SELECT "service_id", "id", "sort_order" FROM "service_themes"
ON CONFLICT DO NOTHING;
