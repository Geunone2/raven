"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { applyTheme, readStoredTheme, storeTheme, type Theme } from "@/lib/theme";

const NEXT_THEME: Record<Theme, Theme> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const THEME_ICON: Record<Theme, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const THEME_LABEL: Record<Theme, string> = {
  system: "시스템 설정",
  light: "라이트 모드",
  dark: "다크 모드",
};

// 마운트 전에는 서버와 동일하게 "system"으로 렌더링(하이드레이션 불일치 방지 —
// lib/hooks/useLiveNow.ts와 동일한 패턴). 클릭할 때마다 시스템 → 라이트 → 다크 →
// 시스템 순으로 순환하며, 선택값은 localStorage에 저장되어 다음 방문에도 유지된다.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // lib/hooks/useLiveNow.ts와 동일한 트릭: setTimeout(fn, 0)으로 한 틱 미뤄서
    // effect 본문에서 곧장 setState하는 걸 피한다(react-hooks/set-state-in-effect).
    const timeout = setTimeout(() => {
      setTheme(readStoredTheme());
      setMounted(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const handleClick = () => {
    const next = NEXT_THEME[theme];
    setTheme(next);
    storeTheme(next);
    applyTheme(next);
  };

  const Icon = THEME_ICON[theme];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!mounted}
      aria-label={`화면 테마: ${THEME_LABEL[theme]} (클릭해서 전환)`}
      title={THEME_LABEL[theme]}
      className={`inline-flex items-center justify-center rounded-md p-2 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-50 ${className}`}
    >
      <Icon className="size-5" />
    </button>
  );
}
