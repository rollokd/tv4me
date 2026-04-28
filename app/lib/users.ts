import { db } from "../db";
import { user } from "./schema/auth-schema";
import { eq } from "drizzle-orm";

export const getUser = async (userId: string) => {
  try {
    const users = await db.select().from(user).where(eq(user.id, userId));
    return users[0] ?? null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
