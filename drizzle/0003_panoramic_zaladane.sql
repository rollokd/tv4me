ALTER TYPE "public"."status" RENAME TO "show_status";--> statement-breakpoint
ALTER TABLE "episode_watches" RENAME COLUMN "series_id" TO "tmdb_tv_id";--> statement-breakpoint
ALTER TABLE "shows" RENAME COLUMN "series_id" TO "tmdb_tv_id";--> statement-breakpoint
ALTER TABLE "shows" RENAME COLUMN "series" TO "title";--> statement-breakpoint
ALTER TABLE "episode_watches" DROP CONSTRAINT "episode_watches_user_id_series_id_watchthrough_season_number_episode_number_unique";--> statement-breakpoint
ALTER TABLE "episode_watches" DROP CONSTRAINT "episode_watches_user_id_series_id_shows_user_id_series_id_fk";
--> statement-breakpoint
ALTER TABLE "shows" DROP CONSTRAINT "shows_user_id_series_id_pk";--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_user_id_tmdb_tv_id_pk" PRIMARY KEY("user_id","tmdb_tv_id");--> statement-breakpoint
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_user_id_tmdb_tv_id_shows_user_id_tmdb_tv_id_fk" FOREIGN KEY ("user_id","tmdb_tv_id") REFERENCES "public"."shows"("user_id","tmdb_tv_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_user_id_tmdb_tv_id_watchthrough_season_number_episode_number_unique" UNIQUE("user_id","tmdb_tv_id","watchthrough","season_number","episode_number");