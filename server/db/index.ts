import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"

// Initialize the SQLite client (Turso)
const client = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_AUTH_TOKEN!,
})

// Initialize the Drizzle ORM
export const db = drizzle(client)
