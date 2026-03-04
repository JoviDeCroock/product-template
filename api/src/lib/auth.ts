import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { Polar } from "@polar-sh/sdk";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import * as schema from "../db/schema";
import { isProduction } from "../utils/isProduction";
import { getApiOrigin, getAppOrigin } from "../utils/urls";

type Env = Cloudflare.Env;

export function createAuth(env: Env) {
  const db = drizzle(env.DB, { schema });
  const appOrigin = getAppOrigin(env);
  const apiOrigin = getApiOrigin(env);

  const polarClient = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: isProduction(env) ? "production" : "sandbox",
  });

  return betterAuth({
    // We can improve this with CloudFlare KV based rate limits in the future if needed
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
      },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: [appOrigin],
    plugins: [
      polar({
        client: polarClient,
        // We disable automatic customer creation because we want to control when customers are created in Polar
        // this also allows your auth to work without a working polar key.
        createCustomerOnSignUp: false,
        use: [
          checkout({
            authenticatedUsersOnly: true,
            products: [
              {
                productId: env.POLAR_PRO_PRODUCT_ID,
                slug: "pro",
              },
            ],
            // This success URL is more to support local-dev so we don't have to only use
            // webhooks. All though local webhooks are now possible with https://polar.sh/docs/integrate/webhooks/locally
            successUrl: `${apiOrigin}/api/billing-success?checkout_id={CHECKOUT_ID}`,
            returnUrl: `${appOrigin}/billing`,
          }),
          portal(),
          webhooks({
            secret: env.POLAR_WEBHOOK_SECRET,
            onSubscriptionUpdated: async (payload) => {
              const customerId = payload.data.customerId;
              const currentPeriodEnd = payload.data.currentPeriodEnd
                ? new Date(payload.data.currentPeriodEnd)
                : null;

              await db
                .update(schema.subscription)
                .set({
                  plan: payload.data.productId === env.POLAR_PRO_PRODUCT_ID ? "pro" : "free",
                  status: payload.data.status,
                  currentPeriodEnd,
                  updatedAt: new Date(),
                })
                .where(eq(schema.subscription.polarCustomerId, customerId));
            },
            onSubscriptionActive: async (payload) => {
              const customerId = payload.data.customerId;
              const subscriptionId = payload.data.id;
              const currentPeriodEnd = payload.data.currentPeriodEnd
                ? new Date(payload.data.currentPeriodEnd)
                : null;

              // Find user by polar customer ID in subscription table
              const existing = await db
                .select()
                .from(schema.subscription)
                .where(eq(schema.subscription.polarCustomerId, customerId))
                .get();

              const now = new Date();

              if (existing) {
                await db
                  .update(schema.subscription)
                  .set({
                    plan: "pro",
                    status: "active",
                    polarSubscriptionId: subscriptionId,
                    currentPeriodEnd,
                    updatedAt: now,
                  })
                  .where(eq(schema.subscription.id, existing.id));
              } else {
                // No existing subscription row, create one
                // First find user ID by customer ID
                const user = await db
                  .select()
                  .from(schema.user)
                  .where(eq(schema.user.id, payload.data.customer.externalId as string))
                  .get();

                if (user) {
                  await db.insert(schema.subscription).values({
                    id: crypto.randomUUID(),
                    userId: user.id,
                    polarCustomerId: customerId,
                    polarSubscriptionId: subscriptionId,
                    plan: "pro",
                    status: "active",
                    currentPeriodEnd,
                    createdAt: now,
                    updatedAt: now,
                  });
                }
              }
            },
            onSubscriptionCanceled: async (payload) => {
              const customerId = payload.data.customerId;

              await db
                .update(schema.subscription)
                .set({
                  plan: "free",
                  status: "canceled",
                  updatedAt: new Date(),
                })
                .where(eq(schema.subscription.polarCustomerId, customerId));
            },
            onSubscriptionRevoked: async (payload) => {
              const customerId = payload.data.customerId;

              await db
                .update(schema.subscription)
                .set({
                  plan: "free",
                  status: "expired",
                  updatedAt: new Date(),
                })
                .where(eq(schema.subscription.polarCustomerId, customerId));
            },
            onCustomerCreated: async (payload) => {
              const customerId = payload.data.id;
              const email = payload.data.email;

              // Find user by email and create subscription row
              const user = await db
                .select()
                .from(schema.user)
                .where(eq(schema.user.email, email))
                .get();

              if (user) {
                const existing = await db
                  .select()
                  .from(schema.subscription)
                  .where(eq(schema.subscription.userId, user.id))
                  .get();

                const now = new Date();

                if (existing) {
                  await db
                    .update(schema.subscription)
                    .set({ polarCustomerId: customerId, updatedAt: now })
                    .where(eq(schema.subscription.id, existing.id));
                } else {
                  await db.insert(schema.subscription).values({
                    id: crypto.randomUUID(),
                    userId: user.id,
                    polarCustomerId: customerId,
                    plan: "free",
                    status: "active",
                    createdAt: now,
                    updatedAt: now,
                  });
                }
              }
            },
          }),
        ],
      }),
    ],
  });
}
