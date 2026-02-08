export function Footer() {
  return (
    <footer class="bg-neutral-950 border-t border-neutral-800 py-12 px-6">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="text-xl font-bold text-white tracking-tight">Acme</div>
        <nav class="flex gap-6 text-sm text-neutral-400">
          <a href="#features" class="hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" class="hover:text-white transition-colors">
            How it Works
          </a>
          <a href="#pricing" class="hover:text-white transition-colors">
            Pricing
          </a>
        </nav>
        <p class="text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Acme. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
