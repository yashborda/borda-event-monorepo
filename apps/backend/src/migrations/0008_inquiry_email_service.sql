ALTER TABLE "inquiries" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "service" varchar(255);--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "phone" DROP NOT NULL;
