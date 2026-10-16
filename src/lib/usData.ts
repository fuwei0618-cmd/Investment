import { cacheLife } from "next/cache";
import type { Live } from "./dayTrade";
import { parseYahoo, usCheck, usName, US_UNIVERSE, type UsBar } from "./us";
import type { Check } from "./pick";

// 美股股價：雅虎財經的公開股價圖資料（不用金鑰）。YAHOO_BASE 只給本機測試用。
async function yahoo(symbol: string, range: string) {
  const url = `${process.env.YAHOO_BASE ?? "https://query1.finance.yahoo.com"}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`雅虎 ${res.status}`);
  const d = parseYahoo(await res.json());
  if (!d) throw new Error("雅虎沒有資料");
  return d;
}

/** 一次抓很多檔，每次最多 10 檔同時，避免被擋 */
async function many<T>(items: string[], fn: (s: string) => Promise<T>) {
  const out: (T | null)[] = [];
  for (let i = 0; i < items.length; i += 10)
    out.push(
      ...(await Promise.all(
        items.slice(i, i + 10).map((s) => fn(s).catch(() => null)),
      )),
    );
  return out;
}

/** 一年的日 K 線（指數、產業 ETF、個股共用），快取幾小時 */
export async function getUsBars(
  symbols: string[],
): Promise<Record<string, UsBar[]>> {
  "use cache";
  const list = await many(symbols, (s) => yahoo(s, "1y"));
  const ok = list.filter(Boolean).length;
  if (ok) cacheLife("hours");
  else cacheLife("seconds");
  return Object.fromEntries(symbols.map((s, i) => [s, list[i]?.bars ?? []]));
}

export interface UsPick extends Check {
  code: string;
  name: string;
  street: string;
  foreign: number;
  trust: number;
  news: [];
}

/** 從股票池篩強勢股突破，照過幾個條件、量放大多少排 */
export async function getUsPicks(): Promise<
  { date: string; picks: UsPick[] } | { error: string }
> {
  const codes = Object.keys(US_UNIVERSE);
  const bars = await getUsBars(codes);
  const picks: UsPick[] = [];
  let date = "";
  for (const c of codes) {
    const k = usCheck(bars[c]);
    if (!k) continue;
    date = bars[c].at(-1)!.date > date ? bars[c].at(-1)!.date : date;
    picks.push({
      ...k,
      code: c,
      name: usName(c),
      street: "美股",
      foreign: 0,
      trust: 0,
      news: [],
    });
  }
  if (!picks.length) return { error: "美股股價抓不到" };
  picks.sort((a, b) => b.score - a.score || b.volRatio - a.volRatio);
  return { date, picks };
}

/** 盤中最新價（美股追蹤清單、持股提醒用） */
export async function getUsLive(codes: string[]): Promise<Live[]> {
  const list = await many(codes, (s) => yahoo(s, "5d"));
  return codes.flatMap((c, i) => {
    const d = list[i];
    if (!d) return [];
    const last = d.bars.at(-1);
    return [
      {
        code: c,
        name: usName(c),
        price: d.price,
        prev: d.prev ?? 0,
        high: last?.high ?? null,
        low: null,
        vol: Math.round((last?.volume ?? 0) / 1000),
        time: d.time,
      },
    ];
  });
}
