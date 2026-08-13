// 다크모드는 기본적으로 OS/브라우저의 prefers-color-scheme을 따른다
// (app/design-tokens.css). 이 파일은 그 위에 사용자가 라이트/다크를 수동으로
// 강제 선택할 수 있게 하는 얇은 레이어다 — <html data-theme="light|dark">를
// 붙이면 design-tokens.css의 :root[data-theme=...] 오버라이드가 이긴다.
// "시스템 설정" 자체는 선택지가 아니다: 아무것도 선택한 적 없으면(=localStorage에
// 값이 없으면) 그냥 시스템을 따르고, 토글은 라이트/다크 사이만 오간다.
export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "raven_theme";

export function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function readSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function storeTheme(theme: Theme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
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
