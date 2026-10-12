import { cacheLife } from "next/cache";
import { Lottery, hasMarketPrice, parseTwse, phaseOf } from "./lottery";

// 台灣時間的今天
export function todayTw() {
  return new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
}

// 證交所「公開申購公告」，上市和上櫃都在這張表。TWSE_BASE / FINMIND_BASE 只給本機測試指向假資料用。
export async function getLotteries(): Promise<Lottery[] | null> {
  "use cache";
  try {
    const year = new Date(Date.now() + 8 * 3_600_000).getUTCFullYear();
    const res = await fetch(`${process.env.TWSE_BASE ?? "https://www.twse.com.tw"}/rwd/zh/announcement/publicForm?response=json&yy=${year}`);
    if (!res.ok) throw new Error(String(res.status));
    const list = parseTwse(await res.json());
    cacheLife("hours");
    return list;
  } catch {
    cacheLife("seconds");
    return null;
  }
}

// 已經在交易的股票（增資、轉上市）用最近收盤價當市價。
export async function getClose(code: string): Promise<{ price: number; date: string } | null> {
  "use cache";
  try {
    const start = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
    const url = new URL(`${process.env.FINMIND_BASE ?? "https://api.finmindtrade.com"}/api/v4/data`);
    url.searchParams.set("dataset", "TaiwanStockPrice");
    url.searchParams.set("data_id", code);
    url.searchParams.set("start_date", start);
    const headers: HeadersInit = process.env.FINMIND_TOKEN ? { Authorization: `Bearer ${process.env.FINMIND_TOKEN}` } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(String(res.status));
    const last = ((await res.json()) as { data?: { date: string; close: number }[] }).data?.at(-1);
    if (!last) throw new Error("empty");
    cacheLife("hours");
    return { price: last.close, date: last.date };
  } catch {
    cacheLife("seconds");
    return null;
  }
}

// 只替現在看得到的幾檔查市價，避免打太多次 FinMind。
export async function getActive(today: string) {
  const list = await getLotteries();
  if (!list) return null;
  const active = list.map((l) => ({ l, phase: phaseOf(l, today) })).filter((x) => x.phase !== null);
  return Promise.all(
    active.map(async ({ l, phase }) => ({ l, phase: phase!, close: hasMarketPrice(l) ? await getClose(l.code) : null })),
  );
}
