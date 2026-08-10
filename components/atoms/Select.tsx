import { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-md border border-edge-strong bg-surface-sunken px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none ${className}`}
      {...props}
    />
  );
}
