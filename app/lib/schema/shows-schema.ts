import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const session_status = pgEnum("status", [
  "active",
  "paused",
  "abandoned",
]);

export const shows = pgTable("shows", {
  id: integer("series_id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  series: text("series").notNull(),
  status: session_status().default("active"),
  watchthroughCount: integer("watchthrough_count").notNull().default(0),
  imported: boolean("imported").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
