import type { NextRequest } from "next/server";
import { cronOk } from "@/lib/cronAuth";
import type { Holding } from "@/lib/desk";
import { pushLine } from "@/lib/line";
import { intradayAlerts } from "@/lib/notify";
import { load, save, storeReady, US_HOLDINGS_KEY } from "@/lib/store";
import { isUsTradingTime, usSlot } from "@/lib/us";
import { getUsLive } from "@/lib/usData";

// 美股盤中每 5 分鐘（cron-job.org 呼叫，GitHub 排程當備援）：美股持股碰到停損停利或大漲大跌才傳，同一件事一天只傳一次。
// 碎股不能在券商設停損單，靠這個提醒；整股還是要先在 App 設好觸價單。
export async function GET(request: NextRequest) {
  if (!cronOk(request))
    return Response.json({ error: "只給排程用" }, { status: 401 });
  if (!isUsTradingTime() && !request.nextUrl.searchParams.has("force"))
    return Response.json({ skipped: "不是美股盤中" });
  if (!storeReady())
    return Response.json({ error: "雲端倉庫還沒接上" }, { status: 503 });
  try {
    const holdings = await load<Holding[]>(US_HOLDINGS_KEY, []);
    if (!holdings.length) return Response.json({ skipped: "沒有美股持股" });
    const sentKey = `us.alerts.${usSlot().date}`;
    const [quotes, sent] = await Promise.all([
      getUsLive(holdings.map((h) => h.code)),
      load<string[]>(sentKey, []),
    ]);
    const { keys, lines } = intradayAlerts(holdings, quotes, sent);
    if (!lines.length) return Response.json({ skipped: "沒有新警報" });
    await pushLine(["【投資羅盤 美股盤中警報】", ...lines].join("\n"));
    await save(sentKey, [...sent, ...keys]);
    return Response.json({ sent: lines });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "失敗" },
      { status: 500 },
    );
  }
}
