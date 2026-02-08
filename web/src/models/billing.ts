import { signal, computed, action, createModel } from "@preact/signals";
import { authClient } from "../lib/auth";
import { getSubscription, type SubscriptionResponse } from "../lib/api";

export const BillingModel = createModel(() => {
  const loading = signal(true);
  const subscription = signal<SubscriptionResponse | null>(null);
  const error = signal<string | null>(null);
  const upgradeLoading = signal(false);
  const plan = computed(() => subscription.value?.plan ?? "free");
  const isPro = computed(() => plan.value === "pro");

  const fetch = action(async () => {
    loading.value = true;
    error.value = null;
    try {
      subscription.value = await getSubscription();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load subscription";
    } finally {
      loading.value = false;
    }
  });

  const upgrade = action(async () => {
    upgradeLoading.value = true;
    try {
      const res = await authClient.$fetch<{ url: string }>("/checkout", {
        method: "POST",
        body: { slug: "pro" },
      });

      if ("data" in res && res.data?.url) {
        window.location.href = res.data.url;
      } else if ("url" in res) {
        window.location.href = res.url;
      }
    } catch {
      upgradeLoading.value = false;
      error.value = "Failed to start checkout";
    }
  });

  const manage = action(async () => {
    try {
      const res = await authClient.$fetch<{ url: string }>("/customer/portal", {
        method: "GET",
      });
      if ("data" in res && res.data?.url) {
        window.location.href = res.data.url;
      } else if ("url" in res) {
        window.location.href = res.url;
      }
    } catch {
      error.value = "Failed to open customer portal";
    }
  });

  return { loading, subscription, error, upgradeLoading, plan, isPro, fetch, upgrade, manage };
});
