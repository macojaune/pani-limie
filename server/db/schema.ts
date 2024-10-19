import { sqliteTable, real, text, integer } from "drizzle-orm/sqlite-core"

export const powerStatuses = sqliteTable("power_statuses", {
  id: text("id").primaryKey(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  hasPower: integer("has_power", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
})

export type PowerStatus = typeof powerStatuses.$inferSelect
export type InsertPowerStatus = typeof powerStatuses.$inferInsert
