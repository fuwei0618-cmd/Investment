import type { Metadata } from "next";
import Script from "next/script";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "投資羅盤",
  description: "依課程架構整合的個人投資工具：財務目標、總經、選股、持股管理。",
  appleWebApp: { capable: true, title: "投資", statusBarStyle: "default" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
        {/* OneDrive 同步（Origina 共用）：把 *.v1 這類 localStorage 資料存到 OneDrive，右下角雲朵按鈕 */}
        <Script
          src="https://fuwei0618-cmd.github.io/Entry/sync/origina-sync.js"
          strategy="afterInteractive"
          data-app="investment"
          data-keys={"/\\.v\\d+$/"}
          data-pos="br"
          data-offset="24"
        />
      </body>
    </html>
  );
}
