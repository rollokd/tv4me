CREATE TABLE "episode_watches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"series_id" integer NOT NULL,
	"watchthrough" integer DEFAULT 0 NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"watched_at" timestamp DEFAULT now() NOT NULL,
	"batched" boolean DEFAULT false NOT NULL,
	CONSTRAINT "episode_watches_user_id_series_id_watchthrough_season_number_episode_number_unique" UNIQUE("user_id","series_id","watchthrough","season_number","episode_number")
);
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'shows'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "shows" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_user_id_series_id_pk" PRIMARY KEY("user_id","series_id");--> statement-breakpoint
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_user_id_series_id_shows_user_id_series_id_fk" FOREIGN KEY ("user_id","series_id") REFERENCES "public"."shows"("user_id","series_id") ON DELETE cascade ON UPDATE no action;
