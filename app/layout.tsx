import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/components/atoms/ToastProvider";

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
    <html lang="en" className={`${netmarble.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
