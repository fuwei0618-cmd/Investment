import type { NextRequest } from "next/server";
import { cronOk } from "@/lib/cronAuth";
import { isTradingTime } from "@/lib/dayTrade";
import { getLive } from "@/lib/dayTradeData";
import { taipeiToday, type Holding } from "@/lib/desk";
import { pushLine } from "@/lib/line";
import { intradayAlerts } from "@/lib/notify";
import { HOLDINGS_KEY, load, save, storeReady } from "@/lib/store";

// 盤中每 10 分鐘（GitHub 排程呼叫）：持股碰到停損停利或大漲大跌才傳，同一件事一天只傳一次
export async function GET(request: NextRequest) {
  if (!cronOk(request))
    return Response.json({ error: "只給排程用" }, { status: 401 });
  if (!isTradingTime() && !request.nextUrl.searchParams.has("force"))
    return Response.json({ skipped: "不是盤中" });
  if (!storeReady())
    return Response.json({ error: "雲端倉庫還沒接上" }, { status: 503 });
  try {
    const holdings = await load<Holding[]>(HOLDINGS_KEY, []);
    if (!holdings.length) return Response.json({ skipped: "沒有持股" });
    const sentKey = `alerts.${taipeiToday()}`;
    const [quotes, sent] = await Promise.all([
      getLive(holdings.map((h) => h.code)),
      load<string[]>(sentKey, []),
    ]);
    const { keys, lines } = intradayAlerts(holdings, quotes, sent);
    if (!lines.length) return Response.json({ skipped: "沒有新警報" });
    await pushLine(["【投資羅盤 盤中警報】", ...lines].join("\n"));
    await save(sentKey, [...sent, ...keys]);
    return Response.json({ sent: lines });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "失敗" },
      { status: 500 },
    );
  }
}
