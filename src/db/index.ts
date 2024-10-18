import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"

// Initialize the SQLite client (Turso)
const client = createClient({
  url: import.meta.env.VITE_TURSO_DB_URL,
  authToken: import.meta.env.VITE_TURSO_DB_AUTH_TOKEN,
})

// Initialize the Drizzle ORM
export const db = drizzle(client)
// Log environment variables (for debugging purposes)
console.log("VITE_TURSO_DB_URL:", import.meta.env.VITE_TURSO_DB_URL)
console.log("VITE_TURSO_DB_AUTH_TOKEN:", import.meta.env.VITE_TURSO_DB_AUTH_TOKEN)
