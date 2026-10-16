import type { NextRequest } from "next/server";
import { getNews } from "@/lib/deskData";

// 追蹤清單的新聞：一次最多 10 檔，每檔最多 3 則
export async function GET(request: NextRequest) {
  const codes = (request.nextUrl.searchParams.get("codes") ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[0-9A-Z]{4,6}$/.test(c))
    .slice(0, 10);
  const lists = await Promise.all(codes.map((c) => getNews(c)));
  return Response.json({
    news: Object.fromEntries(codes.map((c, i) => [c, lists[i]])),
  });
}
