import { signal, action, createModel } from "@preact/signals";
import { authClient } from "../lib/auth";

type Tab = "signin" | "signup";

export const AuthFormModel = createModel(() => {
  const tab = signal<Tab>("signin");
  const loading = signal(false);
  const error = signal("");
  const name = signal("");
  const email = signal("");
  const password = signal("");

  const switchTab = action((t: Tab) => {
    tab.value = t;
    error.value = "";
  });

  const signIn = action(async () => {
    loading.value = true;
    error.value = "";
    try {
      const res = await authClient.signIn.email({
        email: email.value,
        password: password.value,
      });
      if (res.error) {
        error.value = res.error.message ?? "Sign in failed";
        return false;
      }
      return true;
    } catch {
      error.value = "Something went wrong. Please try again.";
      return false;
    } finally {
      loading.value = false;
    }
  });

  const signUp = action(async () => {
    loading.value = true;
    error.value = "";
    try {
      const res = await authClient.signUp.email({
        name: name.value,
        email: email.value,
        password: password.value,
      });
      if (res.error) {
        error.value = res.error.message ?? "Sign up failed";
        return false;
      }
      return true;
    } catch {
      error.value = "Something went wrong. Please try again.";
      return false;
    } finally {
      loading.value = false;
    }
  });

  return { tab, loading, error, name, email, password, switchTab, signIn, signUp };
});
