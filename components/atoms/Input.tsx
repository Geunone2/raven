import { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-edge-strong bg-surface-sunken px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none ${className}`}
      {...props}
    />
  );
}
