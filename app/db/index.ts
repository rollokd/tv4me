import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import "../../envConfig";

let _db: NeonHttpDatabase | undefined;

function getDb(): NeonHttpDatabase {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    _db = drizzle({ client: neon(url) });
  }
  return _db;
}

/** Drizzle client; lazily connects on first use (supports `next build` without env). */
export const db = new Proxy({} as NeonHttpDatabase, {
  get(_, prop) {
    const real = getDb();
    const value = Reflect.get(real as object, prop);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
