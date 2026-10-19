import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 起始頁是實戰：打開網址就直接到 /desk；戲單搬到 /play
  async redirects() {
    return [{ source: "/", destination: "/desk", permanent: false }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
