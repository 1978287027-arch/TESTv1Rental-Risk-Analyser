import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "租房风险分析师 — AI 房源风险评估",
  description: "帮你在租房前识别房源风险，避免踩坑",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
