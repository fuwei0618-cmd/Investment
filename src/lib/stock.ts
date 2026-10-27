// 查一檔：把一檔股票的「外資投信、EPS、本益比」整理成麵包店的說法。
// 全部是純函式，資料從 stockData.ts 抓；這裡只負責算與判斷，方便測試。
import type { InstRow } from "./pick";

/** 一天的法人買賣超（張） */
export interface InstDay {
  date: string;
  foreign: number;
  trust: number;
}

/** 外資、投信：最近 n 天每天買賣超、各自連買天數、n 天合計 */
export function instSummary(rows: InstRow[], n = 10) {
  const byDate = new Map<string, InstDay>();
  for (const r of rows) {
    const d = byDate.get(r.date) ?? { date: r.date, foreign: 0, trust: 0 };
    const net = (Number(r.buy) - Number(r.sell)) / 1000; // 股 → 張
    if (/^Foreign_Investor$/.test(r.name)) d.foreign += net;
    else if (r.name === "Investment_Trust") d.trust += net;
    else continue;
    byDate.set(r.date, d);
  }
  const days = [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
  const streakOf = (k: "foreign" | "trust", sign: 1 | -1) => {
    let c = 0;
    for (const d of days) {
      if (sign * d[k] > 0) c++;
      else break;
    }
    return c;
  };
  const sum = (k: "foreign" | "trust") => days.reduce((s, d) => s + d[k], 0);
  return {
    days,
    foreign: { total: sum("foreign"), buyStreak: streakOf("foreign", 1), sellStreak: streakOf("foreign", -1) },
    trust: { total: sum("trust"), buyStreak: streakOf("trust", 1), sellStreak: streakOf("trust", -1) },
  };
}

export type InstSummary = ReturnType<typeof instSummary>;

/** 法人一句話：兩邊同向連買才算「排隊」，一邊買一邊賣是「意見不同」 */
export function instWord(s: InstSummary): { tone: "good" | "meh" | "bad"; text: string } {
  const f = s.foreign;
  const t = s.trust;
  if (f.buyStreak >= 3 && t.buyStreak >= 3) return { tone: "good", text: `外資、投信都連買 ${Math.min(f.buyStreak, t.buyStreak)} 天以上，門口在排隊` };
  if (f.sellStreak >= 3 && t.sellStreak >= 3) return { tone: "bad", text: `外資、投信都連賣 ${Math.min(f.sellStreak, t.sellStreak)} 天以上，大戶在離開` };
  if (f.buyStreak >= 3 || t.buyStreak >= 3) return { tone: "meh", text: `${f.buyStreak >= 3 ? "外資" : "投信"}連買 ${Math.max(f.buyStreak, t.buyStreak)} 天，另一邊還沒跟` };
  if (f.total > 0 && t.total > 0) return { tone: "meh", text: "這十天兩邊都是買多賣少，但沒有連續" };
  if (f.total < 0 && t.total < 0) return { tone: "bad", text: "這十天兩邊都是賣多買少" };
  return { tone: "meh", text: "外資和投信意見不同，先別跟" };
}

/** 一季的 EPS */
export interface EpsQ {
  date: string; // 季底日期，FinMind 給的是公布季度的日期
  eps: number;
}

/** 從財報明細挑出 EPS，依季排序（新的在前） */
export function parseEps(rows: { date: string; type: string; value: number | string }[]): EpsQ[] {
  return rows
    .filter((r) => r.type === "EPS")
    .map((r) => ({ date: String(r.date), eps: Number(r.value) }))
    .filter((q) => Number.isFinite(q.eps))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 最近四季合計，跟再前四季比：越賺越多嗎 */
export function epsSummary(qs: EpsQ[]) {
  const last4 = qs.slice(0, 4);
  const prev4 = qs.slice(4, 8);
  const ttm = last4.length === 4 ? last4.reduce((s, q) => s + q.eps, 0) : null;
  const prev = prev4.length === 4 ? prev4.reduce((s, q) => s + q.eps, 0) : null;
  const growth = ttm !== null && prev !== null && prev > 0 ? (ttm / prev - 1) * 100 : null;
  // 最新一季跟去年同季比
  const yoy = qs.length >= 5 && qs[4].eps > 0 ? (qs[0].eps / qs[4].eps - 1) * 100 : null;
  return { last4, ttm, prev, growth, yoy };
}

export type EpsSummary = ReturnType<typeof epsSummary>;

/** 每月營收：最新一個月跟去年同月比 */
export function revenueYoy(rows: { revenue_year: number | string; revenue_month: number | string; revenue: number | string }[]) {
  const list = rows
    .map((r) => ({ y: Number(r.revenue_year), m: Number(r.revenue_month), v: Number(r.revenue) }))
    .sort((a, b) => b.y - a.y || b.m - a.m);
  if (!list.length) return null;
  const now = list[0];
  const ago = list.find((r) => r.y === now.y - 1 && r.m === now.m);
  return ago && ago.v > 0 ? { year: now.y, month: now.m, yoy: (now.v / ago.v - 1) * 100 } : null;
}

/** 本益比跟自己過去比：五年區間、現在落在哪 */
export function peBand(rows: { date: string; PER: number | string }[]) {
  const list = rows.map((r) => ({ date: String(r.date), pe: Number(r.PER) })).filter((r) => r.pe > 0).sort((a, b) => a.date.localeCompare(b.date));
  if (list.length < 20) return null;
  const pes = list.map((r) => r.pe);
  const avg = pes.reduce((s, v) => s + v, 0) / pes.length;
  const sd = Math.sqrt(pes.reduce((s, v) => s + (v - avg) ** 2, 0) / pes.length);
  const now = list[list.length - 1];
  const sorted = [...pes].sort((a, b) => a - b);
  // 現在比過去幾成的日子貴
  const rank = sorted.filter((v) => v <= now.pe).length / sorted.length;
  const level: "cheap" | "normal" | "pricey" = now.pe < avg - sd ? "cheap" : now.pe > avg + sd ? "pricey" : "normal";
  return { now: now.pe, date: now.date, avg, low: avg - sd, high: avg + sd, min: sorted[0], max: sorted[sorted.length - 1], rank, level };
}

export type PeBand = NonNullable<ReturnType<typeof peBand>>;

/** 四象限：是不是冠軍 × 貴不貴，用麵包店的話講結論 */
export function quadrant(eps: EpsSummary, rev: { yoy: number } | null, pe: PeBand | null) {
  // 冠軍＝越賺越多（四季合計成長）而且越賣越多（營收年增）；只有一項算半個
  const earnUp = eps.growth !== null ? eps.growth > 0 : null;
  const sellUp = rev ? rev.yoy > 0 : null;
  const points = (earnUp ? 1 : 0) + (sellUp ? 1 : 0);
  const known = (earnUp !== null ? 1 : 0) + (sellUp !== null ? 1 : 0);
  const champion = known === 0 ? null : points === known;
  const cheap = pe ? pe.level !== "pricey" : null;
  if (champion === null || cheap === null) {
    return { cell: "unknown" as const, em: "❓", title: "資料不夠", tag: ["meh", "再查一下"] as const, why: "EPS、營收或本益比其中一項抓不到，先用問 AI 補。" };
  }
  if (champion && cheap) return { cell: "go" as const, em: "🏆", title: "冠軍＋便宜", tag: ["good", "可以進，先設停損"] as const, why: "越賣越多、越賺越多，本益比又沒有比它自己平常貴。" };
  if (champion && !cheap) return { cell: "wait" as const, em: "💎", title: "冠軍但太貴", tag: ["meh", "放進觀察名單"] as const, why: "店很好，但現在比它自己平常貴太多，等它跌回合理價。" };
  if (!champion && cheap) return { cell: "trap" as const, em: "🪤", title: "便宜但不是冠軍", tag: ["bad", "便宜有原因"] as const, why: "賺的或賣的沒有變多，本益比低是因為大家不敢買。" };
  return { cell: "run" as const, em: "🏃", title: "又貴又不是冠軍", tag: ["bad", "快跑"] as const, why: "沒有變好，股價卻比平常貴，沒有理由留著。" };
}

/** 股號只收四到六碼數字或字母 */
export const cleanCode = (s: string) => (s ?? "").trim().toUpperCase().replace(/\.TW[O]?$/, "").slice(0, 6);
export const isCode = (s: string) => /^[0-9][0-9A-Z]{3,5}$/.test(s);
