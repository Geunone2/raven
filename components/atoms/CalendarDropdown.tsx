"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DropdownProps } from "react-day-picker";

export function CalendarDropdown({
  options,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = options?.find((option) => option.value === value);

  function selectOption(optionValue: number) {
    onChange?.({
      target: { value: String(optionValue) },
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 rounded-md border border-edge-strong bg-surface-sunken px-2 py-1 text-sm font-semibold text-ink hover:border-brand/60 disabled:opacity-50"
      >
        {selected?.label}
        <ChevronDown className="size-3.5 text-ink-faint" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-1/2 top-full z-40 mt-1 max-h-56 w-28 -translate-x-1/2 overflow-y-auto rounded-md border border-edge bg-surface p-1 shadow-lg"
        >
          {options?.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                disabled={option.disabled}
                onClick={() => selectOption(option.value)}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-hover disabled:opacity-40 ${
                  option.value === value ? "bg-brand/10 font-semibold text-brand" : "text-ink"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
