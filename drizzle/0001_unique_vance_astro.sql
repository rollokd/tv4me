CREATE TYPE "public"."status" AS ENUM('active', 'paused', 'abandoned');--> statement-breakpoint
CREATE TABLE "shows" (
	"series_id" integer PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"series" text NOT NULL,
	"status" "status" DEFAULT 'active',
	"watchthrough_count" integer DEFAULT 0 NOT NULL,
	"imported" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;