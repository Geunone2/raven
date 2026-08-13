import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/atoms/ToastProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const netmarble = localFont({
  src: [
    { path: "../public/netmarble_font/netmarbleL.ttf", weight: "300", style: "normal" },
    { path: "../public/netmarble_font/netmarbleM.ttf", weight: "500", style: "normal" },
    { path: "../public/netmarble_font/netmarbleB.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-netmarble",
});

export const metadata: Metadata = {
  title: "레이븐2 길드 운영",
  description: "레이븐2 길드 운영 관리 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${netmarble.variable} h-full antialiased`}
      // theme-init 스크립트가 하이드레이션 전에 이 엘리먼트의 data-theme
      // 속성을 직접 건드리기 때문에(app/globals.css, lib/theme.ts 참고),
      // 서버가 렌더링한 속성과 실제 DOM이 달라지는 게 의도된 동작이다.
      // React가 이걸 진짜 버그로 오인해 hydration mismatch 경고를 띄우지
      // 않도록 명시적으로 억제한다.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* 저장된 라이트/다크 선택을 페인트 전에 <html>에 반영해 깜빡임(FOUC)을
            막는다. 선택이 없으면(=시스템 설정) 아무것도 하지 않고 design-tokens.css의
            prefers-color-scheme 경로를 그대로 따른다. */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
