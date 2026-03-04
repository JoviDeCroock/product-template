import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";
import { Polar } from "@polar-sh/sdk";
import { createAuth } from "./lib/auth";
import { subscription } from "./routes/subscription";
import { Bindings, Variables } from "./types";
import { isProduction } from "./utils/isProduction";
import { getAppOrigin } from "./utils/urls";
import * as schema from "./db/schema";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Security response headers
app.use("/api/*", async (c, next) => {
  await next();
  c.res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  c.res.headers.set("X-Content-Type-Options", "nosniff");
  c.res.headers.set("X-Frame-Options", "DENY");
  c.res.headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
});

// CORS — allow the frontend origin and credentials (cookies)
app.use(
  "/api/*",
  cors({
    origin: (_, c) => getAppOrigin(c.env),
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

app.get("/api/billing-success", async (c) => {
  // Upgrade customer
  const db = drizzle(c.env.DB, { schema });

  const checkoutId = c.req.query("checkout_id");
  if (!checkoutId) {
    return c.json({ error: "Missing checkout_id parameter" }, 400);
  }

  // Initialize Polar client
  const polarClient = new Polar({
    accessToken: c.env.POLAR_ACCESS_TOKEN,
    server: isProduction(c.env) ? "production" : "sandbox",
  });

  // Get checkout session to retrieve customer_id
  const checkout = await polarClient.checkouts.get({ id: checkoutId });

  if (!checkout || !checkout.customerId) {
    return c.json({ error: "Invalid checkout session" }, 400);
  }

  if (typeof checkout.externalCustomerId !== "string" || checkout.externalCustomerId.length === 0) {
    return c.json({ error: "Checkout is missing a user reference" }, 400);
  }

  // List subscriptions for this customer
  const subscriptions = await polarClient.subscriptions.list({
    customerId: checkout.customerId,
    active: true,
  });

  // Find the active subscription (should be the most recent one)
  let activeSubscription = null;
  for await (const sub of subscriptions) {
    const page = sub.result;
    if (page.items && page.items.length > 0) {
      // Get the first active subscription
      activeSubscription = page.items[0];
      break;
    }
  }

  if (!activeSubscription) {
    return c.json({ error: "No active subscription found" }, 404);
  }

  // Upsert the subscription row to keep checkout success idempotent.
  const now = new Date();
  await db
    .insert(schema.subscription)
    .values({
      id: crypto.randomUUID(),
      plan: "pro",
      status: "active",
      createdAt: now,
      polarCustomerId: checkout.customerId,
      userId: checkout.externalCustomerId,
      polarSubscriptionId: activeSubscription.id,
      currentPeriodEnd: activeSubscription.currentPeriodEnd
        ? new Date(activeSubscription.currentPeriodEnd)
        : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.subscription.userId,
      set: {
        plan: "pro",
        status: "active",
        polarCustomerId: checkout.customerId,
        polarSubscriptionId: activeSubscription.id,
        currentPeriodEnd: activeSubscription.currentPeriodEnd
          ? new Date(activeSubscription.currentPeriodEnd)
          : null,
        updatedAt: now,
      },
    });

  return c.redirect(`${getAppOrigin(c.env)}/billing?success=true`);
});

// Mount BetterAuth handler
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  try {
    const auth = createAuth(c.env);
    return auth.handler(c.req.raw);
  } catch (error) {
    console.error("Error in auth handler:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// Session middleware for protected routes
app.use("/api/v1/*", async (c, next) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok" });
});

// Example protected route
app.get("/api/v1/me", (c) => {
  return c.json({ user: c.get("user") });
});

// Subscription
app.route("/api/v1/subscription", subscription);

export default app;
