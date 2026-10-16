import type { NextRequest } from "next/server";

/** 排程（Vercel 或 GitHub）呼叫時要帶 CRON_SECRET */
export const cronOk = (request: NextRequest) =>
  !!process.env.CRON_SECRET &&
  request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
