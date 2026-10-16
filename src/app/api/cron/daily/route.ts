import type { NextRequest } from "next/server";
import { getLive } from "@/lib/dayTradeData";
import { taipeiToday, verdict, type Holding } from "@/lib/desk";
import { getTaiex } from "@/lib/deskData";
import { getChips } from "@/lib/chipsData";
import { mood } from "@/lib/chips";
import { pushLine } from "@/lib/line";
import { composeMessage } from "@/lib/notify";
import { HOLDINGS_KEY, load, passOk, storeReady } from "@/lib/store";
import { getTodayAnswers } from "@/lib/todayData";

// 每個交易日收盤後（vercel.json 排程）檢查持股，傳 LINE 給自己。
// 排程由 Vercel 帶 CRON_SECRET 呼叫；網頁上的「傳一則測試」用 POST 加通關密語。
async function run() {
  const holdings = storeReady() ? await load<Holding[]>(HOLDINGS_KEY, []) : [];
  const [taiex, chips, t, live] = await Promise.all([
    getTaiex(),
    getChips(),
    getTodayAnswers(),
    holdings.length ? getLive(holdings.map((h) => h.code)).catch(() => []) : [],
  ]);
  const m = chips ? mood(chips.days, chips.margin?.change ?? null) : null;
  const text = composeMessage({
    date: taipeiToday(),
    verdict: verdict({
      above: taiex?.above ?? null,
      mood: m?.light ?? null,
      season: t.season?.light ?? null,
    }),
    taiex,
    holdings,
    prices: Object.fromEntries(live.map((q) => [q.code, q.price || q.prev])),
  });
  await pushLine(text);
  return text;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return Response.json({ error: "只給排程用" }, { status: 401 });
  try {
    return Response.json({ sent: await run() });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "失敗" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    pass?: string;
  } | null;
  if (!passOk(body?.pass))
    return Response.json({ error: "通關密語不對" }, { status: 401 });
  try {
    return Response.json({ sent: await run() });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "失敗" },
      { status: 500 },
    );
  }
}
