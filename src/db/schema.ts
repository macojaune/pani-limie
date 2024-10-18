import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const powerStatuses = sqliteTable("power_statuses", {
  id: text("id").primaryKey(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  hasPower: integer("has_power", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type PowerStatus = typeof powerStatuses.$inferSelect;
