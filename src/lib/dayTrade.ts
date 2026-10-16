// 認識當沖：成本試算、昨天當沖最熱的股票、盤中即時報價。全部是學習用，不是推薦。

const num = (s: unknown) => Number(String(s ?? "").replace(/,/g, "")) || 0;
const csvRow = (line: string) =>
  [...line.matchAll(/"([^"]*)"|([^,]+)|(?<=,|^)(?=,|$)/g)].map(
    (m) => m[1] ?? m[2] ?? "",
  );

interface Table {
  fields: string[];
  data: unknown[][];
}

/** 證交所的表：可能是 CSV 文字（前面有標題列）、{fields,data}，或 {tables:[…]}。找出欄位含 mustHave 的那一張 */
export function readTable(t: unknown, mustHave: string): Table | null {
  if (typeof t === "string") {
    const text = t.replace(/^﻿/, "").trim();
    if (text.startsWith("{")) return readTable(JSON.parse(text), mustHave);
    const lines = text.split(/\r?\n/);
    const h = lines.findIndex((l) => l.includes(mustHave));
    if (h < 0) return null;
    const fields = csvRow(lines[h]).map((f) => f.trim());
    const data = lines
      .slice(h + 1)
      .map(csvRow)
      .filter(
        (r) =>
          r.length >= fields.length - 1 && /^\w+$/.test(String(r[0]).trim()),
      );
    return { fields, data };
  }
  if (!t || typeof t !== "object") return null;
  const o = t as { fields?: string[]; data?: unknown[][]; tables?: unknown[] };
  if (o.fields?.some((f) => f.includes(mustHave)))
    return { fields: o.fields, data: o.data ?? [] };
  for (const x of o.tables ?? []) {
    const r = readTable(x, mustHave);
    if (r) return r;
  }
  return null;
}

const col = (fields: string[], word: string) =>
  fields.findIndex((f) => f.includes(word));

/** 證交所每日收盤行情 → 代號對成交股數 */
export function parseVolumes(t: unknown) {
  const m = new Map<string, number>();
  const tb = readTable(t, "成交股數");
  if (!tb) return m;
  const iC = col(tb.fields, "證券代號");
  const iV = col(tb.fields, "成交股數");
  for (const r of tb.data) m.set(String(r[iC]).trim(), num(r[iV]));
  return m;
}

export interface HotRow {
  code: string;
  name: string;
  /** 當沖成交張數 */
  lots: number;
  /** 當沖佔這檔今天成交量的比例 */
  ratio: number | null;
}

/** 證交所當日沖銷交易標的（TWTB4U）→ 當沖量最大的前 n 檔，附當沖比例 */
export function parseDayTrade(
  t: unknown,
  volumes: Map<string, number>,
  n = 15,
): HotRow[] {
  const tb = readTable(t, "當日沖銷交易成交股數");
  if (!tb) return [];
  const iC = col(tb.fields, "證券代號");
  const iN = col(tb.fields, "證券名稱");
  const iS = col(tb.fields, "當日沖銷交易成交股數");
  return tb.data
    .map((r) => {
      const code = String(r[iC]).trim();
      const shares = num(r[iS]);
      const vol = volumes.get(code);
      return {
        code,
        name: String(r[iN]).trim(),
        lots: Math.round(shares / 1000),
        ratio: vol ? shares / vol : null,
      };
    })
    .filter((x) => x.lots > 0 && !x.code.startsWith("00"))
    .sort((a, b) => b.lots - a.lots)
    .slice(0, n);
}

/** 台股每一檔（跳動單位） */
export function tick(price: number) {
  if (price < 10) return 0.01;
  if (price < 50) return 0.05;
  if (price < 100) return 0.1;
  if (price < 500) return 0.5;
  if (price < 1000) return 1;
  return 5;
}

/** 當沖成本：買賣手續費各 0.1425%×折扣（最低 20 元），證交稅當沖減半 0.15%。算出要漲多少才打平 */
export function breakEven(price: number, shares: number, discount = 1) {
  const amt = price * shares;
  const fee = (a: number) => Math.max(20, Math.round(a * 0.001425 * discount));
  const fees = fee(amt) * 2;
  const tax = Math.round(amt * 0.0015);
  const cost = fees + tax;
  const pct = amt > 0 ? cost / amt : 0;
  const t = tick(price);
  return {
    amount: Math.round(amt),
    fees,
    tax,
    cost,
    pct,
    /** 要漲幾檔才打平 */
    ticks: Math.ceil((price * pct) / t),
    tick: t,
  };
}

export interface Live {
  code: string;
  name: string;
  price: number | null;
  prev: number;
  high: number | null;
  low: number | null;
  /** 累積成交張數 */
  vol: number;
  time: string;
}

const n0 = (s: unknown) => {
  const v = Number(String(s ?? "").split("_")[0]);
  return Number.isFinite(v) && v > 0 ? v : null;
};

/** 證交所基本市況報導（mis.twse.com.tw）→ 每檔最新價。還沒成交的那幾秒，用最佳買價代替 */
export function parseMis(json: unknown): Live[] {
  const arr = (json as { msgArray?: Record<string, string>[] })?.msgArray ?? [];
  return arr.map((m) => ({
    code: m.c,
    name: m.n,
    price: n0(m.z) ?? n0(m.b) ?? n0(m.a),
    prev: n0(m.y) ?? 0,
    high: n0(m.h),
    low: n0(m.l),
    vol: num(m.v),
    time: m.t ?? "",
  }));
}

/** 台北時間現在是不是盤中（週一到週五 9:00–13:30） */
export function isTradingTime(now = new Date()) {
  const tw = new Date(now.getTime() + 8 * 3600_000);
  const d = tw.getUTCDay();
  const m = tw.getUTCHours() * 60 + tw.getUTCMinutes();
  return d >= 1 && d <= 5 && m >= 540 && m <= 810;
}
