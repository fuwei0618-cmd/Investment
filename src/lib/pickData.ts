import { cacheLife } from "next/cache";
import { getStreets } from "./chipsData";
import {
  INVERSE,
  aboveMonthLine,
  candidates,
  check,
  checkTrust,
  trustCandidates,
  type Bar,
  type Check,
  type InstRow,
} from "./pick";

export async function fm(dataset: string, id: string, days: number) {
  const url = new URL(
    `${process.env.FINMIND_BASE ?? "https://api.finmindtrade.com"}/api/v4/data`,
  );
  url.searchParams.set("dataset", dataset);
  url.searchParams.set("data_id", id);
  url.searchParams.set(
    "start_date",
    new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10),
  );
  const headers: HeadersInit = process.env.FINMIND_TOKEN
    ? { Authorization: `Bearer ${process.env.FINMIND_TOKEN}` }
    : {};
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(String(res.status));
  return (((await res.json()) as { data?: unknown[] }).data ?? []) as Record<
    string,
    unknown
  >[];
}

const toBars = (rows: Record<string, unknown>[]): Bar[] =>
  rows.map((r) => ({
    date: String(r.date),
    close: Number(r.close),
    max: Number(r.max),
    volume: Number(r.Trading_Volume),
  }));

export interface Pick extends Check {
  code: string;
  name: string;
  street: string;
  /** 今天外資、投信買超（億） */
  foreign: number;
  trust: number;
  /** 最近幾天的新聞標題，幫你做「為什麼爆量」的功課 */
  news: News[];
}

export interface News {
  date: string;
  title: string;
  link: string;
  source: string;
}

export const toNews = (rows: Record<string, unknown>[]): News[] =>
  rows
    .map((r) => ({
      date: String(r.date ?? "").slice(0, 10),
      title: String(r.title ?? ""),
      link: String(r.link ?? ""),
      source: String(r.source ?? ""),
    }))
    .filter((n) => n.title && /^https?:\/\//.test(n.link))
    .sort((a, b) => b.date.localeCompare(a.date))
    // 同一則新聞常被不同網站轉載，標題一樣的只留一則
    .filter((n, i, a) => a.findIndex((m) => m.title === n.title) === i)
    .slice(0, 5);

export type PlayId = "breakout" | "trust";

// 今天的候選：從大戶逛街地圖挑前 8 檔（大戶波段＝外資投信同買；跟投信＝投信有買），每檔抓 45 天股價和法人買賣細查

export async function getPicks(play: PlayId = "breakout"): Promise<
  | {
      date: string;
      market: ReturnType<typeof aboveMonthLine>;
      picks: Pick[];
      inverse: number | null;
    }
  | { error: string }
> {
  "use cache";
  try {
    const map = await getStreets();
    if (!("streets" in map)) throw new Error(map.error);
    const list = (play === "trust" ? trustCandidates : candidates)(map.streets);
    const judge = play === "trust" ? checkTrust : check;
    const [taiex, inv, ...rows] = await Promise.all([
      fm("TaiwanStockPrice", "TAIEX", 45).catch(() => []),
      fm("TaiwanStockPrice", INVERSE.code, 15).catch(() => []),
      ...list.map((c) =>
        (async () => {
          const [p, i, n] = await Promise.all([
            fm("TaiwanStockPrice", c.code, 45),
            fm("TaiwanStockInstitutionalInvestorsBuySell", c.code, 15),
            fm("TaiwanStockNews", c.code, 4).catch(() => []), // 新聞抓不到不影響篩選
          ]);
          const k = judge(toBars(p), i as unknown as InstRow[]);
          return k ? { ...c, ...k, news: toNews(n) } : null;
        })().catch(() => null),
      ), // 一檔抓不到就跳過，不拖垮整份名單
    ]);
    const picks = (rows.filter(Boolean) as Pick[]).sort(
      (a, b) =>
        b.score - a.score ||
        (play === "trust"
          ? b.trust - a.trust
          : b.foreign + b.trust - (a.foreign + a.trust)),
    );
    cacheLife("hours");
    const invBars = toBars(inv).sort((a, b) => a.date.localeCompare(b.date));
    // 反向 ETF 的收盤價，給大盤在月線下時的放空流程
    const inverse = invBars.length ? invBars[invBars.length - 1].close : null;
    return {
      date: map.date,
      market: aboveMonthLine(toBars(taiex)),
      picks,
      inverse,
    };
  } catch (e) {
    cacheLife("seconds");
    return { error: e instanceof Error ? e.message : "失敗" };
  }
}
