import { useModel } from "@preact/signals";
import { AuthModel } from "../models/auth";

export function DashboardHeader() {
  const auth = useModel(AuthModel);

  async function handleSignOut() {
    await auth.signOut();
    window.location.href = "/";
  }

  return (
    <header class="fixed top-0 left-0 right-0 z-50 bg-neutral-950 border-b border-neutral-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div class="text-lg sm:text-xl font-bold text-white">Acme</div>
        <div class="flex items-center gap-4">
          <a
            href="/dashboard"
            class="text-sm sm:text-base text-neutral-300 hover:text-white transition-colors"
          >
            Dashboard
          </a>
          <a
            href="/billing"
            class="text-sm sm:text-base text-neutral-300 hover:text-white transition-colors"
          >
            Billing
          </a>
          <button
            onClick={handleSignOut}
            class="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors whitespace-nowrap"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
