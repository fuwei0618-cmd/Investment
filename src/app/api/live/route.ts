import type { NextRequest } from "next/server";
import { getLive } from "@/lib/dayTradeData";

// 盤中即時報價（證交所基本市況報導，約 5–20 秒更新）。一次最多 20 檔
export async function GET(request: NextRequest) {
  const codes = (request.nextUrl.searchParams.get("codes") ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[0-9A-Z]{4,6}$/.test(c))
    .slice(0, 20);
  if (!codes.length)
    return Response.json({ error: "請給股票代號" }, { status: 400 });
  try {
    return Response.json({
      quotes: await getLive(codes),
      at: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "抓不到即時報價" },
      { status: 502 },
    );
  }
}
