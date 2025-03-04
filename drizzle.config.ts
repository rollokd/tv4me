import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./app/lib/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://neondb_owner:npg_QP5cjt7RUoAY@ep-soft-sound-abcds2m2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
  },
});
