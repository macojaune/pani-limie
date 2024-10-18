import { type Config, defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.VITE_TURSO_DB_URL,
    authToken: process.env.VITE_TURSO_DB_AUTH_TOKEN,
  },
} as Config)
