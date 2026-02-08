import { signal, computed, action, createModel } from "@preact/signals";
import { authClient } from "../lib/auth";

export const AuthModel = createModel(() => {
  const loading = signal(true);
  const user = signal<{ id: string; name: string; email: string } | null>(null);
  const authenticated = computed(() => user.value !== null);

  const checkSession = action(async () => {
    loading.value = true;
    try {
      const res = await authClient.getSession();
      user.value = res.data?.user ?? null;
    } catch {
      user.value = null;
    } finally {
      loading.value = false;
    }
  });

  const signOut = action(async () => {
    await authClient.signOut();
    user.value = null;
  });

  return { loading, user, authenticated, checkSession, signOut };
});
