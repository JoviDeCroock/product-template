import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { getUserPlan, PLAN_LIMITS } from "../lib/plans";
import { Bindings, Variables } from "../types";

export const subscription = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET / — returns user's current plan and limits
subscription.get("/", async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const userId = c.get("user")?.id;
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const plan = await getUserPlan(db, userId);
  const limits = PLAN_LIMITS[plan];

  return c.json({
    plan,
    limits,
  });
});
