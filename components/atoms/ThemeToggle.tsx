"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readStoredTheme, readSystemTheme, storeTheme, type Theme } from "@/lib/theme";

const THEME_ICON: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
};

const THEME_LABEL: Record<Theme, string> = {
  light: "라이트 모드",
  dark: "다크 모드",
};

// 마운트 전에는 라이트 아이콘으로 렌더링(서버 렌더와 동일한 값 — 하이드레이션
// 불일치 방지, lib/hooks/useLiveNow.ts와 동일한 패턴). 마운트 직후 저장된 선택이
// 있으면 그 값으로, 없으면 시스템 설정으로 아이콘을 맞춘다. 클릭하면 라이트 ↔ 다크로만
// 전환되고(시스템 옵션 없음), 그 순간부터는 시스템 설정과 무관하게 이 선택이 유지된다.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // lib/hooks/useLiveNow.ts와 동일한 트릭: setTimeout(fn, 0)으로 한 틱 미뤄서
    // effect 본문에서 곧장 setState하는 걸 피한다(react-hooks/set-state-in-effect).
    const timeout = setTimeout(() => {
      setTheme(readStoredTheme() ?? readSystemTheme());
      setMounted(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const handleClick = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
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
