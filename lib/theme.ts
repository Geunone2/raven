// 다크모드는 기본적으로 OS/브라우저의 prefers-color-scheme을 따른다
// (app/design-tokens.css). 이 파일은 그 위에 사용자가 수동으로 라이트/다크를
// 강제 선택할 수 있게 하는 얇은 레이어다 — <html data-theme="light|dark">를
// 붙이면 design-tokens.css의 :root[data-theme=...] 오버라이드가 이긴다.
export type Theme = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "raven_theme";

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function storeTheme(theme: Theme) {
  if (theme === "system") {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

export function applyTheme(theme: Theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

// app/layout.tsx의 beforeInteractive 스크립트가 실행하는 것과 동일한 로직.
// 페인트 전에 저장된 선택을 <html>에 반영해 라이트/다크 사이의 깜빡임(FOUC)을 막는다.
export const THEME_INIT_SCRIPT = `
try {
  var t = localStorage.getItem("${THEME_STORAGE_KEY}");
  if (t === "light" || t === "dark") {
    document.documentElement.setAttribute("data-theme", t);
  }
} catch (e) {}
`;
