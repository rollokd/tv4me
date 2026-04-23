import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  primaryKey,
  serial,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const session_status = pgEnum("status", [
  "active",
  "paused",
  "abandoned",
]);

export const shows = pgTable(
  "shows",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** TMDB TV id (legacy column name `series_id` from original schema). */
    tmdbTvId: integer("series_id").notNull(),
    title: text("series").notNull(),
    status: session_status().default("active"),
    watchthroughCount: integer("watchthrough_count").notNull().default(0),
    imported: boolean("imported").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.tmdbTvId] }),
  }),
);

export const episodeWatches = pgTable(
  "episode_watches",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tmdbTvId: integer("series_id").notNull(),
    watchthrough: integer("watchthrough").notNull().default(0),
    seasonNumber: integer("season_number").notNull(),
    episodeNumber: integer("episode_number").notNull(),
    watchedAt: timestamp("watched_at").notNull().defaultNow(),
    batched: boolean("batched").notNull().default(false),
  },
  (t) => ({
    showFk: foreignKey({
      columns: [t.userId, t.tmdbTvId],
      foreignColumns: [shows.userId, shows.tmdbTvId],
    }).onDelete("cascade"),
    episodeUnique: unique().on(
      t.userId,
      t.tmdbTvId,
      t.watchthrough,
      t.seasonNumber,
      t.episodeNumber,
    ),
  }),
);
