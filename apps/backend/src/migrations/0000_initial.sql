CREATE TYPE "public"."blog_publish_status" AS ENUM('draft', 'scheduled', 'published');--> statement-breakpoint
CREATE TYPE "public"."blog_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."robots_directive" AS ENUM('index', 'noindex');--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"folder" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_files_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "admin_user_permissions" (
	"user_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"granted_by" uuid,
	CONSTRAINT "admin_user_permissions_user_id_permission_id_pk" PRIMARY KEY("user_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "admin_user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" uuid,
	CONSTRAINT "admin_user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"password_hash" text,
	"google_id" varchar(255),
	"full_name" varchar(255),
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"deleted_reason" text,
	"created_by" uuid,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "magic_link_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"user_type" varchar(10) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_link_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"user_type" varchar(10) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"label" varchar(255),
	"resource" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"user_type" varchar(10) NOT NULL,
	"family_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name"),
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "website_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"password_hash" text,
	"google_id" varchar(255),
	"full_name" varchar(255),
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"deleted_reason" text,
	"created_by" uuid,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "website_users_email_unique" UNIQUE("email"),
	CONSTRAINT "website_users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"status" "blog_status" DEFAULT 'draft' NOT NULL,
	"banner_image_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"excerpt" text,
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" text,
	"canonical_url" text,
	"og_title" varchar(255),
	"og_description" text,
	"og_image_id" uuid,
	"twitter_title" varchar(255),
	"twitter_description" text,
	"twitter_image_id" uuid,
	"robots" "robots_directive" DEFAULT 'index' NOT NULL,
	"googlebot" "robots_directive" DEFAULT 'index' NOT NULL,
	"created_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_reason" text,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_categories_category_name_unique" UNIQUE("category_name"),
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"avatar_id" uuid,
	"bio" text,
	"designation" varchar(255),
	"website" text,
	"twitter" text,
	"linkedin" text,
	"instagram" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_reason" text,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_authors_slug_unique" UNIQUE("slug"),
	CONSTRAINT "blog_authors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "blog_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "blog_status" DEFAULT 'draft' NOT NULL,
	"excerpt" text,
	"created_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_reason" text,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_tags_name_unique" UNIQUE("name"),
	CONSTRAINT "blog_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text,
	"author_id" uuid,
	"featured_image_id" uuid,
	"featured_image_alt" text,
	"status" "blog_publish_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"reading_time" integer DEFAULT 0 NOT NULL,
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" text,
	"canonical_url" text,
	"og_title" varchar(255),
	"og_description" text,
	"og_image_id" uuid,
	"twitter_title" varchar(255),
	"twitter_description" text,
	"twitter_image_id" uuid,
	"robots" "robots_directive" DEFAULT 'index' NOT NULL,
	"googlebot" "robots_directive" DEFAULT 'index' NOT NULL,
	"created_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_reason" text,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_category_relations" (
	"blog_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "blog_category_relations_blog_id_category_id_pk" PRIMARY KEY("blog_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "blog_tag_relations" (
	"blog_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "blog_tag_relations_blog_id_tag_id_pk" PRIMARY KEY("blog_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "admin_user_permissions" ADD CONSTRAINT "admin_user_permissions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_permissions" ADD CONSTRAINT "admin_user_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_permissions" ADD CONSTRAINT "admin_user_permissions_granted_by_admin_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_assigned_by_admin_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_deleted_by_admin_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_users" ADD CONSTRAINT "website_users_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_users" ADD CONSTRAINT "website_users_deleted_by_admin_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_banner_image_id_media_files_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_og_image_id_media_files_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_twitter_image_id_media_files_id_fk" FOREIGN KEY ("twitter_image_id") REFERENCES "public"."media_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_deleted_by_admin_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_authors" ADD CONSTRAINT "blog_authors_avatar_id_media_files_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_authors" ADD CONSTRAINT "blog_authors_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_authors" ADD CONSTRAINT "blog_authors_deleted_by_admin_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_deleted_by_admin_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_blog_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."blog_authors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_featured_image_id_media_files_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_og_image_id_media_files_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_twitter_image_id_media_files_id_fk" FOREIGN KEY ("twitter_image_id") REFERENCES "public"."media_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_deleted_by_admin_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_category_relations" ADD CONSTRAINT "blog_category_relations_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_category_relations" ADD CONSTRAINT "blog_category_relations_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_tag_relations" ADD CONSTRAINT "blog_tag_relations_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_tag_relations" ADD CONSTRAINT "blog_tag_relations_tag_id_blog_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."blog_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "magic_link_tokens_email_idx" ON "magic_link_tokens" USING btree ("email","user_type");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" USING btree ("user_id","user_type");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_idx" ON "refresh_tokens" USING btree ("user_id","user_type");
