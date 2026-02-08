import { useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { useModel } from "@preact/signals";
import { AuthModel } from "../../models/auth";
import { BillingModel } from "../../models/billing";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";

export function Billing() {
  const { route, query } = useLocation();
  const auth = useModel(AuthModel);
  const billing = useModel(BillingModel);

  const success = query.success === "true";

  useEffect(() => {
    auth.checkSession().then(() => {
      if (!auth.authenticated.value) {
        route("/auth");
        return;
      }
      billing.fetch();
    });
  }, []);

  if (billing.loading.value) {
    return (
      <div class="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p class="text-neutral-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div class="min-h-screen mt-12 bg-neutral-950">
      <div class="max-w-2xl mx-auto px-4 py-12">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-white">Billing</h1>
          <Button variant="ghost" size="sm" onClick={() => route("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        {success && (
          <Alert variant="success" class="mb-6">
            Your subscription has been updated successfully.
          </Alert>
        )}

        {billing.error.value && <Alert class="mb-6">{billing.error.value}</Alert>}

        {/* Current Plan */}
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-white">Current Plan</h2>
              <p class="text-sm text-neutral-400 mt-1">
                You are on the{" "}
                <span
                  class={`font-medium ${billing.isPro.value ? "text-violet-400" : "text-neutral-300"}`}
                >
                  {billing.isPro.value ? "Pro" : "Free"}
                </span>{" "}
                plan.
              </p>
            </div>
            {billing.isPro.value ? (
              <Button variant="secondary" onClick={() => billing.manage()}>
                Manage Subscription
              </Button>
            ) : (
              <Button onClick={() => billing.upgrade()} disabled={billing.upgradeLoading.value}>
                {billing.upgradeLoading.value ? "Redirecting..." : "Upgrade to Pro"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
