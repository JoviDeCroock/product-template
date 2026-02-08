interface AlertProps {
  children: preact.ComponentChildren;
  variant?: "error" | "inline-error" | "success";
  class?: string;
}

const variantClasses: Record<string, string> = {
  error: "p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm",
  success: "p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm",
};

export function Alert({ children, variant = "error", class: className }: AlertProps) {
  if (variant === "inline-error") {
    return <p class={`text-sm text-red-400 ${className ?? ""}`.trim()}>{children}</p>;
  }

  return <div class={`${variantClasses[variant]} ${className ?? ""}`.trim()}>{children}</div>;
}
