import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import "../../envConfig";

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return drizzle({ client: neon(databaseUrl) });
}

type DbClient = ReturnType<typeof createDb>;

let dbInstance: DbClient | undefined;

export function getDb(): DbClient {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

export const db = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
