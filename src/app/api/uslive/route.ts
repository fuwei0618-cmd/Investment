import type { NextRequest } from "next/server";
import { getUsLive } from "@/lib/usData";

// 美股最新價（雅虎），一次最多 20 檔
export async function GET(request: NextRequest) {
  const codes = (request.nextUrl.searchParams.get("codes") ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z][A-Z.-]{0,6}$/.test(c))
    .slice(0, 20);
  if (!codes.length)
    return Response.json({ error: "請給股票代號" }, { status: 400 });
  try {
    return Response.json({ quotes: await getUsLive(codes) });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "抓不到美股報價" },
      { status: 502 },
    );
  }
}
