import type { NextRequest } from "next/server";
import { cronOk } from "@/lib/cronAuth";
import { upcoming, type Holding } from "@/lib/desk";
import { pushLine } from "@/lib/line";
import { composeMessage, composeMorning } from "@/lib/notify";
import { load, save, storeReady, US_HOLDINGS_KEY } from "@/lib/store";
import { getTodayAnswers } from "@/lib/todayData";
import { aboveMa20, usSlot, usVerdict } from "@/lib/us";
import { getUsBars, getUsLive, getUsPicks } from "@/lib/usData";

// 美股 LINE 提醒（GitHub 排程呼叫，夏令冬令各排一次，用紐約時間挑對的那次）：
// 開盤前：今晚能不能出手、標普和恐慌指數、名單全過的股票；收盤後：每檔美股持股要不要賣。
// 手動測試：?slot=pre 或 ?slot=post 會直接傳。
export async function GET(request: NextRequest) {
  if (!cronOk(request))
    return Response.json({ error: "只給排程用" }, { status: 401 });
  const asked = request.nextUrl.searchParams.get("slot");
  const now = usSlot();
  const slot = asked === "pre" || asked === "post" ? asked : now.slot;
  if (!slot) return Response.json({ skipped: "不是美股提醒的時間" });
  try {
    // 同一天同一則只傳一次（GitHub 排程偶爾會重跑）
    const sentKey = `us.sent.${slot}.${now.date}`;
    if (!asked && storeReady() && (await load<boolean>(sentKey, false)))
      return Response.json({ skipped: "今天已經傳過" });
    const [bars, t] = await Promise.all([
      getUsBars(["^GSPC", "^VIX"]),
      getTodayAnswers(),
    ]);
    const spx = aboveMa20(bars["^GSPC"]);
    const vix = bars["^VIX"].at(-1)?.close ?? null;
    const v = usVerdict({
      above: spx?.above ?? null,
      vix,
      season: t.season?.light ?? null,
    });
    // 用紐約日期：收盤後那則在台灣是隔天清晨，講的還是紐約當天
    const date = now.date;
    let text: string;
    if (slot === "pre") {
      const picks = await getUsPicks();
      text = composeMorning({
        date,
        verdict: v,
        market: "us",
        facts: [
          spx
            ? `標普 500 收 ${Math.round(spx.close)}，${spx.above ? "在" : "跌破"}月線${spx.above ? "上" : ""}；恐慌指數 ${vix?.toFixed(1) ?? "抓不到"}。`
            : "標普 500 暫時抓不到。",
        ],
        events: upcoming(date, 1, "us"),
        picks: [
          {
            title: "強勢股突破",
            names:
              "picks" in picks
                ? picks.picks
                    .filter((x) => x.pass)
                    .slice(0, 5)
                    .map((x) => `${x.name} ${x.code}`)
                : [],
          },
        ],
      });
    } else {
      const holdings = storeReady()
        ? await load<Holding[]>(US_HOLDINGS_KEY, [])
        : [];
      const live = holdings.length
        ? await getUsLive(holdings.map((h) => h.code)).catch(() => [])
        : [];
      text = composeMessage({
        date,
        verdict: v,
        market: "us",
        taiex: spx,
        holdings,
        prices: Object.fromEntries(
          live.map((q) => [q.code, q.price || q.prev]),
        ),
      });
    }
    await pushLine(text);
    if (storeReady()) await save(sentKey, true);
    return Response.json({ sent: text });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "失敗" },
      { status: 500 },
    );
  }
}
