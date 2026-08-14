"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function CustomSelect({
  id,
  name,
  defaultValue,
  options,
  onValueChange,
  className = "",
}: {
  id?: string;
  name?: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
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

  const selected = options.find((option) => option.value === value);

  return (
    // min-w-0: 이 div가 그리드/플렉스 아이템으로 쓰일 때 기본값(min-width: auto) 때문에
    // 아래 truncate가 무시되고 긴 옵션 라벨(예: 일정 제목) 길이만큼 화면이 밀려나가는
    // 문제가 있었다(2026-08-14) — 부모 컨텍스트와 무관하게 항상 자기 폭까지만 차지하게 고정.
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full min-w-0 items-center justify-between rounded-md border border-edge-strong bg-surface-sunken px-3 py-2 text-sm text-ink hover:border-brand/60 focus:border-brand focus:outline-none"
      >
        <span className="min-w-0 flex-1 truncate text-left">{selected?.label}</span>
        <ChevronDown className="size-4 shrink-0 text-ink-faint" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-40 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-edge bg-surface p-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => {
                  setValue(option.value);
                  onValueChange?.(option.value);
                  setOpen(false);
                }}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-hover ${
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
