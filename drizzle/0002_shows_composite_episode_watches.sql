DROP TABLE IF EXISTS "shows" CASCADE;--> statement-breakpoint
CREATE TABLE "shows" (
	"user_id" text NOT NULL,
	"tmdb_tv_id" integer NOT NULL,
	"title" text NOT NULL,
	"status" "status" DEFAULT 'active',
	"watchthrough_count" integer DEFAULT 0 NOT NULL,
	"imported" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shows_user_id_tmdb_tv_id_pk" PRIMARY KEY("user_id","tmdb_tv_id")
);
--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "episode_watches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tmdb_tv_id" integer NOT NULL,
	"watchthrough" integer DEFAULT 0 NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"watched_at" timestamp DEFAULT now() NOT NULL,
	"batched" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_user_id_tmdb_tv_id_shows_user_id_tmdb_tv_id_fk" FOREIGN KEY ("user_id","tmdb_tv_id") REFERENCES "public"."shows"("user_id","tmdb_tv_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_user_id_tmdb_tv_id_watchthrough_season_number_episode_number_unique" UNIQUE("user_id","tmdb_tv_id","watchthrough","season_number","episode_number");
