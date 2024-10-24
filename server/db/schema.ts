import { sqliteTable, real, text, integer } from "drizzle-orm/sqlite-core";

export const powerStatuses = sqliteTable("power_statuses", {
  id: text("id").primaryKey(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isOn: integer("has_power", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type PowerStatus = typeof powerStatuses.$inferSelect;
export type InsertPowerStatus = typeof powerStatuses.$inferInsert;

export const waterStatuses = sqliteTable("water_statuses", {
  id: text("id").primaryKey(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isOn: integer("has_water", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type WaterStatus = typeof waterStatuses.$inferSelect;
export type InsertWaterStatus = typeof waterStatuses.$inferInsert;
