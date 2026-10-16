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
  /** 每個條件：過了沒、現在多少、為什麼看這個、還差什麼 */
  conds: Cond[];
  /** 停損價、停利（先賣一半）漲幅，照這張策略卡算 */
  stopAt: number;
  targetPct: number;
  /** 停損怎麼來的（接在「停損」兩個字後面）、停利後怎麼出場、下單時要注意的、另外一定要賣的時候 */
  stopText: string;
  exitText: string;
  entryNote: string;
  mustSell?: string;
}

export interface Cond {
  ok: boolean;
  text: string;
  why: string;
  /** 沒過的話，還要等什麼 */
  need: string;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

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
  const conds: Cond[] = [
    {
      ok: streak >= 3,
      text: `大戶連買 ${streak} 天（要 3 天以上）`,
      why: WHY.streak,
      need: `外資或投信再連買 ${Math.max(0, 3 - streak)} 天（連到第 3 天）`,
    },
    {
      ok: volRatio >= 2,
      text: `成交量是平常 ${volRatio.toFixed(1)} 倍（要 2 倍）`,
      why: WHY.vol,
      need: "成交量放大到平常 2 倍以上",
    },
    {
      ok: breakout,
      text: `收盤 ${r2(today.close)} ${breakout ? "已突破" : "還沒突破"}前高 ${r2(high20)}`,
      why: WHY.breakout,
      need: `收盤站上 ${r2(high20)}`,
    },
  ];
  const score = conds.filter((c) => c.ok).length;
  // 還沒突破（前高在買價之上）就沒有突破點可守，只用少 7%
  const below = high20 < today.close;
  return {
    close: today.close,
    high20,
    volRatio,
    streak,
    breakout,
    pass: score === 3,
    score,
    conds,
    stopAt: r2(
      below ? Math.max(high20, today.close * 0.93) : today.close * 0.93,
    ),
    targetPct: 0.15,
    stopText: below
      ? `取「跌破突破點 ${r2(high20)}」和「買價少 7%」兩個裡面比較高、會先碰到的那個。`
      : `先用「買價少 7%」（這檔還沒突破前高 ${r2(high20)}，沒有突破點可以守）。`,
    exitText: "賺 15% 先賣一半，剩下跌破 10 日均線再賣完",
    entryNote: `隔天買的話，開盤後股價沒跌破 ${r2(high20)} 才買。`,
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

/** 每筆最多總資金一成，照策略卡給的停損價和停利漲幅，算好買多少、最多賠多少 */
export function plan(
  capital: number,
  price: number,
  stopAt: number,
  targetPct: number,
) {
  const budget = Math.floor(capital * 0.1);
  const shares = Math.floor(budget / price);
  const lots = Math.floor(shares / 1000);
  const odd = shares % 1000;
  const fee = (n: number) => Math.max(20, Math.round(n * price * 0.001425));
  const stop = r2(stopAt);
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
    target: r2(price * (1 + targetPct)),
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
  return {
    buy: x.pass,
    rows: x.conds,
    wait: x.conds.filter((c) => !c.ok).map((c) => c.need),
    stop: x.stopText,
    target: x.exitText,
  };
}

/** 看 K 線、看新聞的外部連結（Yahoo 股市） */
export const links = (code: string) => ({
  chart: `https://tw.stock.yahoo.com/quote/${code}.TW/technical-analysis`,
  news: `https://tw.stock.yahoo.com/quote/${code}.TW/news`,
});

/* ── 第二張策略卡：跟著投信買 ── */

/** 今天投信買超的個股（不含 ETF），照投信買超金額排，取前 n 檔去細查 */
export function trustCandidates(streets: Street[], n = 8) {
  return streets
    .flatMap((s) => s.shops.map((sh) => ({ ...sh, street: s.name })))
    .filter((sh) => !sh.code.startsWith("00") && sh.trust > 0)
    .sort((a, b) => b.trust - a.trust)
    .slice(0, n);
}

/** 從最近一天往回數，投信自己連續買超幾天 */
export function trustStreak(rows: InstRow[]) {
  return buyStreak(
    rows
      .filter((r) => r.name === "Investment_Trust")
      .map((r) => ({ ...r, name: "Investment_Trust" })),
  );
}

/** 下一個季底（3、6、9、12 月底），投信作帳的時間點 */
export function nextQuarterEnd(date: string) {
  const [y, m] = date.split("-").map(Number);
  const qm = Math.ceil(m / 3) * 3;
  const last = new Date(Date.UTC(y, qm, 0)).getUTCDate();
  return `${y}-${String(qm).padStart(2, "0")}-${last}`;
}

export const WHY_TRUST = {
  streak:
    "投信是國內基金，錢比外資少，常集中買幾檔中小型股。連買好幾天，代表他們在建立部位，不是隨手買一筆。",
  notHot:
    "跟投信是要搭他們還在買的那一段。如果已經漲很多，等於你在幫前面的人抬轎，賺的空間小、跌的空間大。",
  trend:
    "站在月線上，代表最近一個月買的人大多是賺錢的，比較不會一漲就有人急著賣。",
};

/** 跟著投信買的三個條件：投信連買三天以上、近 20 天漲不到 15%、收盤在月線之上 */
export function checkTrust(bars: Bar[], inst: InstRow[]): Check | null {
  const b = [...bars].sort((x, y) => x.date.localeCompare(y.date));
  if (b.length < 21) return null;
  const today = b[b.length - 1];
  const prior = b.slice(-21, -1);
  const high20 = Math.max(...prior.map((x) => x.max));
  const avgVol = prior.reduce((s, x) => s + x.volume, 0) / prior.length;
  const volRatio = avgVol > 0 ? today.volume / avgVol : 0;
  const ma20 = b.slice(-20).reduce((s, x) => s + x.close, 0) / 20;
  const rise = today.close / b[b.length - 21].close - 1;
  const streak = trustStreak(inst);
  const conds: Cond[] = [
    {
      ok: streak >= 3,
      text: `投信連買 ${streak} 天（要 3 天以上）`,
      why: WHY_TRUST.streak,
      need: `投信再連買 ${Math.max(0, 3 - streak)} 天（連到第 3 天）`,
    },
    {
      ok: rise <= 0.15,
      text: `近 20 天漲了 ${(rise * 100).toFixed(1)}%（要 15% 以內）`,
      why: WHY_TRUST.notHot,
      need: "等它拉回、漲幅降到 15% 以內",
    },
    {
      ok: today.close > ma20,
      text: `收盤 ${r2(today.close)} ${today.close > ma20 ? "在" : "跌破"}月線 ${r2(ma20)}${today.close > ma20 ? "之上" : ""}`,
      why: WHY_TRUST.trend,
      need: `收盤站回月線 ${r2(ma20)} 之上`,
    },
  ];
  const score = conds.filter((c) => c.ok).length;
  return {
    close: today.close,
    high20,
    volRatio,
    streak,
    breakout: today.close > high20,
    pass: score === 3,
    score,
    conds,
    stopAt: r2(today.close * 0.93),
    targetPct: 0.1,
    stopText: "用「買價少 7%」。另外投信連續賣兩天，代表他們開始下車，也要走。",
    exitText: "賺 10% 先賣一半，剩下在投信連賣兩天或季底前一週賣完",
    entryNote:
      "投信買的多半是中小型股，價格跳得快，不要追高，掛今天收盤價附近就好。",
    mustSell: `兩個一定要賣的時候：投信連續賣超兩天，或季底（${nextQuarterEnd(today.date)}）前一週。`,
  };
}
