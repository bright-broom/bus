import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// =============================
// フォント設定: Geist Sans と Geist Mono
// =============================
const geistSans = Geist({
  subsets: ["latin"],
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

// =============================
// メタデータ: ページの基本情報
// =============================
export const metadata: Metadata = {
  title: "バススケジュール",
  description: "リアルタイムのバス時刻表と運行情報を提供するアプリケーション",
};

// =============================
// レイアウト: 全ページ共通の構造
// =============================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
