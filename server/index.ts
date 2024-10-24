import { Hono } from "hono";
import { powerStatuses, waterStatuses } from "./db/schema";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { db } from "./db";
import { desc, getTableColumns, gte, sql } from "drizzle-orm";

const obfuscateCoordinate = (coord: number, factor = 0.001) => {
  return coord + (Math.random() - 0.667) * factor;
};

const app = new Hono();
app.use(logger());

app.use(
  "/api/*",
  cors({
    origin: [
      "http://localhost:5173",
      "https://pani-limie.netlify.app",
      "https://www.pani-limie.netlify.app",
      "https://pani-limye.marvinl.com",
      "https://www.pani-limye.marvinl.com",
      "https://pani-limie.marvinl.com",
      "https://www.pani-limie.marvinl.com",
      "https://pani-dlo.marvinl.com",
      "https://www.pani-dlo.marvinl.com",
    ],
  }),
);

app.get("/", (c) => c.text("Pani limyè!"));

app.get("/api/power-statuses", async (c) => {
  try {
    const statuses = await db
      .select({
        ...getTableColumns(powerStatuses),
        lastStatus: sql`MAX(${powerStatuses.createdAt})`,
      })
      .from(powerStatuses)
      .where(
        gte(powerStatuses.createdAt, new Date(Date.now() - 6 * 60 * 60 * 1000)),
      ) //limit to 6 hours ago
      .orderBy(desc(powerStatuses.createdAt))
      .groupBy(powerStatuses.latitude, powerStatuses.longitude);

    const obscuredStatuses = statuses.map((status) => ({
      ...status,
      latitude: obfuscateCoordinate(status.latitude),
      longitude: obfuscateCoordinate(status.longitude),
    }));

    return c.json(obscuredStatuses);
  } catch (error) {
    console.error("Error fetching power statuses:", error);
    return c.json({ error: "Failed to fetch power statuses" }, 500);
  }
});

app.post("/api/power-status", async (c) => {
  try {
    const { latitude, longitude, isOn } = await c.req.json();
    const newStatus = await db
      .insert(powerStatuses)
      .values({
        id: crypto.randomUUID(),
        latitude,
        longitude,
        isOn,
        createdAt: new Date(),
      })
      .returning()
      .get();
    return c.json(newStatus, 201);
  } catch (error) {
    console.error("Error creating power status:", error);
    return c.json({ error: "Failed to create power status" }, 500);
  }
});

app.get("/api/water-statuses", async (c) => {
  try {
    const statuses = await db
      .select({
        ...getTableColumns(waterStatuses),
        lastStatus: sql`MAX(${waterStatuses.createdAt})`,
      })
      .from(waterStatuses)
      .where(
        gte(waterStatuses.createdAt, new Date(Date.now() - 6 * 60 * 60 * 1000)),
      ) //limit to 6 hours ago
      .orderBy(desc(waterStatuses.createdAt))
      .groupBy(waterStatuses.latitude, waterStatuses.longitude);

    const obscuredStatuses = statuses.map((status) => ({
      ...status,
      latitude: obfuscateCoordinate(status.latitude),
      longitude: obfuscateCoordinate(status.longitude),
    }));
    return c.json(obscuredStatuses);
  } catch (error) {
    console.error("Error fetching water statuses:", error);
    return c.json({ error: "Failed to fetch water statuses" }, 500);
  }
});

app.post("/api/water-status", async (c) => {
  try {
    const { latitude, longitude, isOn } = await c.req.json();
    const newStatus = await db
      .insert(waterStatuses)
      .values({
        id: crypto.randomUUID(),
        latitude,
        longitude,
        isOn,
        createdAt: new Date(),
      })
      .returning()
      .get();
    return c.json(newStatus, 201);
  } catch (error) {
    console.error("Error creating water status:", error);
    return c.json({ error: "Failed to create water status" }, 500);
  }
});

const port = 3000;
console.log(`Server is running on port ${port}`);

export default {
  fetch: app.fetch,
  port,
};
