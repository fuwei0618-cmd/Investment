// 交易成績單：每筆賣掉後記下來，算勝率、平均賺賠，看跟著策略卡做到底有沒有賺。
import type { Holding } from "./desk";

export interface Closed {
  market: "tw" | "us";
  play: string;
  code: string;
  name: string;
  buyDate: string;
  buyPrice: number;
  shares: number;
  sellDate: string;
  sellPrice: number;
  /** 照什麼賣的 */
  why: "stop" | "target" | "other";
  /** 買進加賣出的手續費（舊紀錄沒有就當 0） */
  fees?: number;
}

export const JOURNAL_KEY = "journal.v1";

/** 扣掉手續費後真的賺賠多少 */
export const pnlOf = (c: Closed) =>
  (c.sellPrice - c.buyPrice) * c.shares - (c.fees ?? 0);
export const pctOf = (c: Closed) => pnlOf(c) / (c.buyPrice * c.shares);

/** 持股賣掉 → 一筆成績。原因看賣價碰到停損還是停利 */
export function close(
  h: Holding,
  market: "tw" | "us",
  sellPrice: number,
  buyPrice: number,
  sellDate: string,
  sellFee = 0,
): Closed {
  return {
    market,
    play: h.play ?? (market === "us" ? "美股強勢股突破" : "台股"),
    code: h.code,
    name: h.name,
    buyDate: h.saved,
    buyPrice,
    shares: h.shares,
    sellDate,
    sellPrice,
    why:
      sellPrice <= h.stop ? "stop" : sellPrice >= h.target ? "target" : "other",
    fees: (h.buyFee ?? 0) + sellFee,
  };
}

export interface Stats {
  n: number;
  wins: number;
  rate: number | null;
  /** 賺的那幾筆平均賺幾 %、賠的那幾筆平均賠幾 % */
  avgWin: number | null;
  avgLoss: number | null;
  /** 總賺賠（同一種貨幣才加總） */
  total: number;
}

export function stats(list: Closed[]): Stats {
  const pcts = list.map(pctOf);
  const win = pcts.filter((p) => p > 0);
  const loss = pcts.filter((p) => p <= 0);
  const mean = (a: number[]) =>
    a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
  return {
    n: list.length,
    wins: win.length,
    rate: list.length ? win.length / list.length : null,
    avgWin: mean(win),
    avgLoss: mean(loss),
    total: Math.round(list.reduce((s, c) => s + pnlOf(c), 0) * 100) / 100,
  };
}

/** 一句話：勝率多少、賺的時候賺多少、賠的時候賠多少 */
export function summary(s: Stats): string {
  if (!s.n) return "還沒有賣掉的紀錄。";
  const p = (x: number) => `${(x * 100).toFixed(1)}%`;
  const avg = [
    s.avgWin != null && `賺的平均 ${p(s.avgWin)}`,
    s.avgLoss != null && `賠的平均 ${p(s.avgLoss)}`,
  ].filter(Boolean);
  return `${s.n} 筆，賺 ${s.wins} 筆、賠 ${s.n - s.wins} 筆，勝率 ${Math.round((s.rate ?? 0) * 100)}%。${avg.length ? avg.join("，") + "。" : ""}`;
}
