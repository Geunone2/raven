import { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-md border border-edge-strong bg-surface-sunken px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none ${className}`}
      {...props}
    />
  );
}
