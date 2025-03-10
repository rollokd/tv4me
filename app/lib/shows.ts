import { eq } from "drizzle-orm";
import { db } from "../db";
import { shows } from "./schema/shows-schema";

export async function getUserShows(userId: string) {
  return db.select().from(shows).where(eq(shows.userId, userId));
}
