import { useModel } from "@preact/signals";
import { AuthFormModel } from "../models/auth-form";
import { Button } from "./ui/Button";
import { Input, Label, LabelText } from "./ui/Input";
import { Alert } from "./ui/Alert";

interface AuthFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function AuthForm({ onSuccess, compact = false }: AuthFormProps) {
  const form = useModel(AuthFormModel);

  async function handleSignIn(e: Event) {
    e.preventDefault();
    const ok = await form.signIn();
    if (ok) onSuccess?.();
  }

  async function handleSignUp(e: Event) {
    e.preventDefault();
    const ok = await form.signUp();
    if (ok) onSuccess?.();
  }

  return (
    <div class={compact ? "w-full" : "min-h-screen flex items-center justify-center px-4 pt-16"}>
      <div class="w-full max-w-md mx-auto">
        {/* Tab toggle */}
        <div class="flex rounded-lg bg-neutral-900 border border-neutral-800 p-1 mb-6">
          <button
            type="button"
            class={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
              form.tab.value === "signin"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
            onClick={() => form.switchTab("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            class={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
              form.tab.value === "signup"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
            onClick={() => form.switchTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Form card */}
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h1 class="text-xl font-semibold text-white mb-6">
            {form.tab.value === "signin" ? "Welcome back" : "Create your account"}
          </h1>

          {form.tab.value === "signin" ? (
            <form onSubmit={handleSignIn} class="flex flex-col gap-4">
              <Label>
                <LabelText>Email</LabelText>
                <Input
                  type="email"
                  required
                  value={form.email.value}
                  onInput={(e) => (form.email.value = (e.target as HTMLInputElement).value)}
                  placeholder="you@example.com"
                />
              </Label>
              <Label>
                <LabelText>Password</LabelText>
                <Input
                  type="password"
                  required
                  value={form.password.value}
                  onInput={(e) => (form.password.value = (e.target as HTMLInputElement).value)}
                  placeholder="••••••••"
                />
              </Label>
              {form.error.value && <Alert variant="inline-error">{form.error.value}</Alert>}
              <Button type="submit" disabled={form.loading.value} class="mt-2 py-2.5">
                {form.loading.value ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} class="flex flex-col gap-4">
              <Label>
                <LabelText>Name</LabelText>
                <Input
                  type="text"
                  required
                  value={form.name.value}
                  onInput={(e) => (form.name.value = (e.target as HTMLInputElement).value)}
                  placeholder="Your name"
                />
              </Label>
              <Label>
                <LabelText>Email</LabelText>
                <Input
                  type="email"
                  required
                  value={form.email.value}
                  onInput={(e) => (form.email.value = (e.target as HTMLInputElement).value)}
                  placeholder="you@example.com"
                />
              </Label>
              <Label>
                <LabelText>Password</LabelText>
                <Input
                  type="password"
                  required
                  value={form.password.value}
                  onInput={(e) => (form.password.value = (e.target as HTMLInputElement).value)}
                  placeholder="••••••••"
                />
              </Label>
              {form.error.value && <Alert variant="inline-error">{form.error.value}</Alert>}
              <Button type="submit" disabled={form.loading.value} class="mt-2 py-2.5">
                {form.loading.value ? "Creating account…" : "Sign Up"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
