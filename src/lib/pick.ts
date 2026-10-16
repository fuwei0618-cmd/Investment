// 衝一把／台股短線的「帶我做」：照操作卡的條件，從今天大戶有買的股票裡篩出符合的，
// 再依你的本錢算好買多少、停損停利價。全部是條件篩選，不是推薦。
import type { Street } from "./chips";

export interface Bar {
  date: string;
  close: number;
  max: number;
  volume: number;
}
export interface InstRow {
  date: string;
  name: string;
  buy: number;
  sell: number;
}

/** 今天外資和投信都買超的個股（不含 ETF），照兩者合計排，取前 n 檔去細查 */
export function candidates(streets: Street[], n = 8) {
  return streets
    .flatMap((s) => s.shops.map((sh) => ({ ...sh, street: s.name })))
    .filter((sh) => !sh.code.startsWith("00") && sh.foreign > 0 && sh.trust > 0)
    .sort((a, b) => b.foreign + b.trust - (a.foreign + a.trust))
    .slice(0, n);
}

/** 從最近一天往回數，外資或投信合計買超連續幾天 */
export function buyStreak(rows: InstRow[]) {
  const net = new Map<string, number>();
  for (const r of rows) {
    if (!/^(Foreign_Investor|Investment_Trust)$/.test(r.name)) continue;
    net.set(r.date, (net.get(r.date) ?? 0) + r.buy - r.sell);
  }
  const days = [...net.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  let k = 0;
  for (const [, v] of days) {
    if (v > 0) k++;
    else break;
  }
  return k;
}

export interface Check {
  close: number;
  /** 前 20 天最高價＝突破點 */
  high20: number;
  /** 今天成交量是前 20 天平均的幾倍 */
  volRatio: number;
  streak: number;
  breakout: boolean;
  pass: boolean;
  /** 三個條件過了幾個 */
  score: number;
}

/** 操作卡的三個條件：大戶連買三天以上、量是平常兩倍、收盤突破前 20 天最高 */
export function check(bars: Bar[], inst: InstRow[]): Check | null {
  const b = [...bars].sort((x, y) => x.date.localeCompare(y.date));
  if (b.length < 21) return null;
  const today = b[b.length - 1];
  const prior = b.slice(-21, -1);
  const high20 = Math.max(...prior.map((x) => x.max));
  const avgVol = prior.reduce((s, x) => s + x.volume, 0) / prior.length;
  const volRatio = avgVol > 0 ? today.volume / avgVol : 0;
  const streak = buyStreak(inst);
  const breakout = today.close > high20;
  const oks = [streak >= 3, volRatio >= 2, breakout];
  const score = oks.filter(Boolean).length;
  return {
    close: today.close,
    high20,
    volRatio,
    streak,
    breakout,
    pass: score === 3,
    score,
  };
}

/** 大盤在月線（20 日均線）之上嗎 */
export function aboveMonthLine(bars: Bar[]) {
  const b = [...bars].sort((x, y) => x.date.localeCompare(y.date)).slice(-20);
  if (b.length < 20) return null;
  const ma = b.reduce((s, x) => s + x.close, 0) / b.length;
  const close = b[b.length - 1].close;
  return { close, ma, above: close > ma };
}

/** 反向 ETF 放空：大盤跌它漲。一般常識整理的規則：跌 5% 停損、漲 8% 先賣一半、最多放兩週 */
export const INVERSE = {
  code: "00632R",
  name: "元大台灣50反1",
  stopPct: 0.05,
  targetPct: 0.08,
};

/** 照操作卡：每筆最多總資金一成；停損＝跌破突破點或少 7%（取先碰到的較高價）；賺 15% 先賣一半。
 *  反向 ETF 傳 short，停損停利改用 INVERSE 的比例 */
export function plan(
  capital: number,
  price: number,
  high20: number,
  short = false,
) {
  const budget = Math.floor(capital * 0.1);
  const shares = Math.floor(budget / price);
  const lots = Math.floor(shares / 1000);
  const odd = shares % 1000;
  const fee = (n: number) => Math.max(20, Math.round(n * price * 0.001425));
  const stop =
    Math.round(
      (short ? price * (1 - INVERSE.stopPct) : Math.max(high20, price * 0.93)) *
        100,
    ) / 100;
  const target =
    Math.round(price * (short ? 1 + INVERSE.targetPct : 1.15) * 100) / 100;
  return {
    budget,
    shares,
    lots,
    odd,
    cost:
      Math.round(shares * price) +
      (lots ? fee(lots * 1000) : 0) +
      (odd ? fee(odd) : 0),
    stop,
    stopLoss: Math.round(shares * (price - stop)),
    target,
  };
}

/** 每個條件的白話「為什麼」 */
export const WHY = {
  streak:
    "大戶連續好幾天都在買，才像是有計畫地慢慢搬貨；只買一天可能只是一筆大單。",
  vol: "成交量變大代表很多人同時在搶，價格比較有力氣往上推。",
  breakout:
    "前 20 天最高價附近，有一群之前買在高點、等著解套賣出的人。收盤衝過去，代表這些賣壓被吃掉了。",
};

/** 資訊模板：今天要不要買、每個條件的狀況和為什麼、想盯的話要等什麼 */
export function brief(x: Check) {
  const r = (n: number) => Math.round(n * 100) / 100;
  const rows = [
    {
      ok: x.streak >= 3,
      text: `大戶連買 ${x.streak} 天（要 3 天以上）`,
      why: WHY.streak,
    },
    {
      ok: x.volRatio >= 2,
      text: `成交量是平常 ${x.volRatio.toFixed(1)} 倍（要 2 倍）`,
      why: WHY.vol,
    },
    {
      ok: x.breakout,
      text: `收盤 ${r(x.close)} ${x.breakout ? "已突破" : "還沒突破"}前高 ${r(x.high20)}`,
      why: WHY.breakout,
    },
  ];
  const wait: string[] = [];
  if (x.streak < 3)
    wait.push(`外資或投信再連買 ${3 - x.streak} 天（連到第 3 天）`);
  if (x.volRatio < 2) wait.push("成交量放大到平常 2 倍以上");
  if (!x.breakout) wait.push(`收盤站上 ${r(x.high20)}`);
  return {
    buy: x.pass,
    rows,
    wait,
    stop: `跌破 ${r(x.high20)}，或比買價少 7%，取比較高的那個`,
    target: "賺 15% 先賣一半，剩下的跌破 10 日均線再賣完",
  };
}

/** 看 K 線、看新聞的外部連結（Yahoo 股市） */
export const links = (code: string) => ({
  chart: `https://tw.stock.yahoo.com/quote/${code}.TW/technical-analysis`,
  news: `https://tw.stock.yahoo.com/quote/${code}.TW/news`,
});
