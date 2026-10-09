import type { MetadataRoute } from "next";

// 加到手機主畫面時的名稱與圖示（嫩芽圖示沿用 Origina 系列風格）
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "投資羅盤",
    short_name: "投資",
    start_url: "/",
    display: "standalone",
    background_color: "#ECE8E1",
    theme_color: "#ECE8E1",
    lang: "zh-Hant",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
