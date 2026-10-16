// 美股實戰：股票池、產業 ETF、強勢股突破三條件、算股數，以及雅虎股價資料的解析。
import type { Check, Cond } from "./pick";

export interface UsBar {
  date: string;
  close: number;
  high: number;
  volume: number;
}

/** 美國前 100 大左右的公司（加上台灣人常看的 TSM、ASML、ARM） */
export const US_UNIVERSE: Record<string, string> = {
  AAPL: "蘋果",
  MSFT: "微軟",
  NVDA: "輝達",
  AMZN: "亞馬遜",
  GOOGL: "谷歌",
  META: "Meta",
  TSLA: "特斯拉",
  AVGO: "博通",
  "BRK-B": "波克夏",
  LLY: "禮來",
  JPM: "摩根大通",
  V: "Visa",
  UNH: "聯合健康",
  XOM: "埃克森美孚",
  MA: "萬事達卡",
  COST: "好市多",
  HD: "家得寶",
  PG: "寶僑",
  JNJ: "嬌生",
  WMT: "沃爾瑪",
  NFLX: "網飛",
  ABBV: "艾伯維",
  BAC: "美國銀行",
  CRM: "Salesforce",
  ORCL: "甲骨文",
  AMD: "超微",
  KO: "可口可樂",
  MRK: "默克",
  CVX: "雪佛龍",
  PEP: "百事",
  ADBE: "Adobe",
  TMO: "賽默飛世爾",
  CSCO: "思科",
  ACN: "埃森哲",
  MCD: "麥當勞",
  LIN: "林德",
  ABT: "亞培",
  WFC: "富國銀行",
  DIS: "迪士尼",
  INTU: "Intuit",
  QCOM: "高通",
  TXN: "德州儀器",
  IBM: "IBM",
  GE: "奇異航太",
  CAT: "開拓重工",
  AMAT: "應用材料",
  NOW: "ServiceNow",
  ISRG: "直覺手術",
  VZ: "威訊",
  PM: "菲利普莫里斯",
  UBER: "Uber",
  GS: "高盛",
  MS: "摩根士丹利",
  AXP: "美國運通",
  BKNG: "Booking",
  SPGI: "標普全球",
  T: "AT&T",
  RTX: "雷神技術",
  NEE: "新紀元能源",
  HON: "漢威聯合",
  LOW: "勞氏",
  PFE: "輝瑞",
  UNP: "聯合太平洋",
  AMGN: "安進",
  BLK: "貝萊德",
  LMT: "洛克希德馬丁",
  DE: "迪爾",
  SBUX: "星巴克",
  MU: "美光",
  LRCX: "科林研發",
  KLAC: "科磊",
  ADI: "亞德諾",
  PANW: "Palo Alto",
  ANET: "Arista",
  PLTR: "Palantir",
  SNPS: "新思科技",
  CDNS: "益華電腦",
  INTC: "英特爾",
  NKE: "Nike",
  BA: "波音",
  COP: "康菲石油",
  C: "花旗",
  SCHW: "嘉信理財",
  MDT: "美敦力",
  GILD: "吉利德",
  BMY: "必治妥施貴寶",
  VRTX: "福泰製藥",
  REGN: "再生元",
  CMCSA: "康卡斯特",
  TMUS: "T-Mobile",
  MO: "奧馳亞",
  UPS: "優比速",
  CRWD: "CrowdStrike",
  SHOP: "Shopify",
  ARM: "安謀",
  TSM: "台積電 ADR",
  ASML: "艾司摩爾",
  DELL: "戴爾",
  COIN: "Coinbase",
  MRVL: "邁威爾",
  MMM: "3M",
  CVS: "CVS",
  ELV: "Elevance",
  SMCI: "美超微",
};

/** 11 個產業 ETF：看哪一條街最強 */
export const US_SECTORS: [string, string][] = [
  ["XLK", "科技"],
  ["XLC", "通訊"],
  ["XLY", "非必需消費"],
  ["XLP", "必需消費"],
  ["XLE", "能源"],
  ["XLF", "金融"],
  ["XLV", "醫療"],
  ["XLI", "工業"],
  ["XLB", "原物料"],
  ["XLRE", "房地產"],
  ["XLU", "公用事業"],
];

export const US_INDICES: [string, string][] = [
  ["^GSPC", "標普 500"],
  ["^IXIC", "那斯達克"],
  ["^SOX", "費城半導體"],
  ["^VIX", "恐慌指數"],
];

/** 常見 ETF 的名字（只拿來顯示，不放進篩選） */
const US_ETF: Record<string, string> = {
  VOO: "標普 500 ETF",
  SPY: "標普 500 ETF",
  QQQ: "那斯達克 100 ETF",
  VTI: "全美股市 ETF",
  SOXX: "半導體 ETF",
  SMH: "半導體 ETF",
  TLT: "美國長天期公債 ETF",
};

export const usName = (code: string) =>
  US_UNIVERSE[code] ?? US_ETF[code] ?? code;

/** 雅虎股價圖資料 → 每日 K 線＋最新價 */
export function parseYahoo(json: unknown): {
  bars: UsBar[];
  price: number | null;
  prev: number | null;
  time: string;
} | null {
  const r = (json as { chart?: { result?: unknown[] } })?.chart?.result?.[0] as
    | {
        meta?: {
          regularMarketPrice?: number;
          chartPreviousClose?: number;
          previousClose?: number;
          regularMarketTime?: number;
        };
        timestamp?: number[];
        indicators?: {
          quote?: {
            close?: (number | null)[];
            high?: (number | null)[];
            volume?: (number | null)[];
          }[];
        };
      }
    | undefined;
  if (!r?.timestamp) return null;
  const q = r.indicators?.quote?.[0] ?? {};
  const bars: UsBar[] = [];
  r.timestamp.forEach((t, i) => {
    const close = q.close?.[i];
    if (close == null) return;
    bars.push({
      date: new Date(t * 1000).toISOString().slice(0, 10),
      close,
      high: q.high?.[i] ?? close,
      volume: q.volume?.[i] ?? 0,
    });
  });
  const m = r.meta ?? {};
  const prev =
    bars.length >= 2
      ? bars[bars.length - 2].close
      : (m.chartPreviousClose ?? m.previousClose ?? null);
  return {
    bars,
    price: m.regularMarketPrice ?? bars.at(-1)?.close ?? null,
    prev,
    time: m.regularMarketTime
      ? new Date(m.regularMarketTime * 1000).toLocaleTimeString("zh-TW", {
          hour12: false,
          timeZone: "Asia/Taipei",
        })
      : "",
  };
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;

export const WHY_US = {
  trend:
    "股價在 50 日和 200 日均線上面，代表短期和長期買的人都在賺錢，賣壓比較小。美國基金經理人很多只買這種「趨勢向上」的股票。",
  vol: "成交量是平常兩倍，代表有大錢在搶。美國沒有每天公布法人買賣，量就是看大戶有沒有進場的線索。",
  breakout: "突破 20 天新高，代表之前想賣的人都賣完了，上面沒有人擋。",
};

/** 美股強勢股突破：在 50、200 日均線上，量是平常兩倍，收盤創 20 天新高 */
export function usCheck(bars: UsBar[]): Check | null {
  const b = [...bars].sort((x, y) => x.date.localeCompare(y.date));
  if (b.length < 200) return null;
  const today = b[b.length - 1];
  const prior = b.slice(-21, -1);
  const high20 = Math.max(...prior.map((x) => x.high));
  const avgVol = avg(prior.map((x) => x.volume));
  const volRatio = avgVol > 0 ? today.volume / avgVol : 0;
  const ma50 = avg(b.slice(-50).map((x) => x.close));
  const ma200 = avg(b.slice(-200).map((x) => x.close));
  const trend = today.close > ma50 && today.close > ma200;
  const breakout = today.close > high20;
  const conds: Cond[] = [
    {
      ok: trend,
      text: `收盤 ${r2(today.close)}，50 日均線 ${r2(ma50)}、200 日均線 ${r2(ma200)}（要兩條都在下面）`,
      why: WHY_US.trend,
      need: `收盤站上 ${r2(Math.max(ma50, ma200))}`,
    },
    {
      ok: volRatio >= 2,
      text: `成交量是平常 ${volRatio.toFixed(1)} 倍（要 2 倍）`,
      why: WHY_US.vol,
      need: "成交量放大到平常 2 倍以上",
    },
    {
      ok: breakout,
      text: `收盤 ${r2(today.close)} ${breakout ? "已突破" : "還沒突破"} 20 天新高 ${r2(high20)}`,
      why: WHY_US.breakout,
      need: `收盤站上 ${r2(high20)}`,
    },
  ];
  const score = conds.filter((c) => c.ok).length;
  const below = high20 < today.close;
  return {
    close: today.close,
    high20,
    volRatio,
    streak: 0,
    breakout,
    pass: score === 3,
    score,
    conds,
    stopAt: r2(
      below ? Math.max(high20, today.close * 0.93) : today.close * 0.93,
    ),
    targetPct: 0.15,
    stopText: below
      ? `取「跌破突破點 ${r2(high20)}」和「買價少 7%」兩個裡面比較高的那個。`
      : `先用「買價少 7%」（還沒突破 ${r2(high20)}）。`,
    exitText: "賺 15% 先賣一半，剩下跌破 50 日均線再賣完",
    entryNote: `美股開盤後股價沒跌破 ${r2(high20)} 才買。`,
  };
}

/** 美股以「股」為單位，每筆最多總資金一成（美元）；手續費依複委託費率另計 */
export function usPlan(
  capital: number,
  price: number,
  stopAt: number,
  targetPct: number,
) {
  const budget = Math.floor(capital * 0.1);
  const shares = Math.floor(budget / price);
  const stop = r2(stopAt);
  return {
    budget,
    shares,
    cost: r2(shares * price),
    stop,
    stopLoss: r2(shares * (price - stop)),
    target: r2(price * (1 + targetPct)),
  };
}

/** 美國紐約時間現在是不是盤中（週一到週五 9:30–16:00，夏令冬令自動換算） */
export function isUsTradingTime(now = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  );
  const m = (Number(p.hour) % 24) * 60 + Number(p.minute);
  return !["Sat", "Sun"].includes(p.weekday) && m >= 570 && m < 960;
}

/** 近 n 天漲跌幅 */
export const changeOver = (bars: UsBar[], n: number) =>
  bars.length > n
    ? bars[bars.length - 1].close / bars[bars.length - 1 - n].close - 1
    : null;

/** 是否在 20 日線上 */
export function aboveMa20(bars: UsBar[]) {
  if (bars.length < 20) return null;
  const ma = avg(bars.slice(-20).map((x) => x.close));
  const close = bars[bars.length - 1].close;
  return { close, ma, above: close > ma };
}
