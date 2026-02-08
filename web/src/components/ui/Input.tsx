import type { JSX } from "preact";

type InputProps = JSX.IntrinsicElements["input"] & { class?: string };

export function Input({ class: className, ...props }: InputProps) {
  return (
    <input
      class={`rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-600 ${className ?? ""}`.trim()}
      {...props}
    />
  );
}

type LabelProps = JSX.IntrinsicElements["label"] & { class?: string };

export function Label({ class: className, children, ...props }: LabelProps) {
  return (
    <label class={`flex flex-col gap-1.5 ${className ?? ""}`.trim()} {...props}>
      {children}
    </label>
  );
}

export function LabelText({ children }: { children: preact.ComponentChildren }) {
  return <span class="text-sm text-neutral-400">{children}</span>;
}
