import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { useModel } from "@preact/signals";
import { AuthModel } from "../models/auth";

export function Header() {
  const scrolled = useSignal(false);
  const mobileOpen = useSignal(false);
  const auth = useModel(AuthModel);

  useEffect(() => {
    function onScroll() {
      scrolled.value = window.scrollY > 10;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    auth.checkSession();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header
      class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled.value
          ? "bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800"
          : "bg-transparent"
      }`}
    >
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" class="text-xl font-bold text-white tracking-tight">
          Acme
        </a>

        {/* Desktop nav */}
        <nav class="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              class="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={auth.authenticated.value ? "/dashboard" : "/auth"}
            class="text-sm font-medium px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors"
          >
            {auth.authenticated.value ? "Dashboard" : "Sign in"}
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          class="md:hidden text-neutral-400 hover:text-white"
          onClick={() => (mobileOpen.value = !mobileOpen.value)}
          aria-label="Toggle menu"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width={2}
          >
            {mobileOpen.value ? (
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen.value && (
        <nav class="md:hidden bg-neutral-950/95 backdrop-blur-lg border-b border-neutral-800 px-6 pb-4 flex flex-col gap-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              class="text-sm text-neutral-400 hover:text-white transition-colors py-1"
              onClick={() => (mobileOpen.value = false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={auth.authenticated.value ? "/dashboard" : "/auth"}
            class="text-sm font-medium px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors text-center"
            onClick={() => (mobileOpen.value = false)}
          >
            {auth.authenticated.value ? "Dashboard" : "Sign in"}
          </a>
        </nav>
      )}
    </header>
  );
}
