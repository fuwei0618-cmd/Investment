// 股票抽籤（公開申購）：整理證交所的申購公告，算出抽一張大概賺多少、值不值得抽。

export const FEE = 20; // 每次申購處理費（沒抽中也要付）
export const WIN_FEE = 50; // 抽中才收的中籤通知郵寄工本費

export interface Lottery {
  name: string;
  code: string;
  market: string; // 初上市、初上櫃、上市增資……
  start: string; // YYYY-MM-DD
  end: string;
  draw: string;
  listing: string;
  price: number | null; // 承銷價（有實際承銷價就用實際的）
  shares: number; // 一次申購幾股
  winRate: number | null; // 中籤率 %，抽完才有
}

// 民國 115/10/22 → 2026-10-22
export function rocToIso(s: string): string {
  const m = s.trim().match(/^(\d{2,3})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return "";
  return `${Number(m[1]) + 1911}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

const num = (s: string) => {
  const v = Number(String(s).replace(/,/g, ""));
  return Number.isFinite(v) && s.trim() !== "" ? v : null;
};

// 證交所 publicForm 回傳的欄位用名字找，欄位順序變了也不會錯。
export function parseTwse(json: { fields?: string[]; data?: string[][] }): Lottery[] {
  const f = (json.fields ?? []).map((x) => x.trim());
  const at = (row: string[], name: string) => row[f.indexOf(name)] ?? "";
  return (json.data ?? [])
    .filter((r) => at(r, "取消公開抽籤").trim() === "" && !/債/.test(at(r, "發行市場")))
    .map((r): Lottery => {
      const actual = num(at(r, "實際承銷價(元)"));
      const rate = num(at(r, "中籤率(%)"));
      return {
        name: at(r, "證券名稱").trim(),
        code: at(r, "證券代號").trim(),
        market: at(r, "發行市場").trim(),
        start: rocToIso(at(r, "申購開始日")),
        end: rocToIso(at(r, "申購結束日")),
        draw: rocToIso(at(r, "抽籤日期")),
        listing: rocToIso(at(r, "撥券日期(上市、上櫃日期)")),
        price: actual ?? num(at(r, "承銷價(元)")),
        shares: num(at(r, "申購股數")) ?? 1000,
        winRate: rate && rate > 0 ? rate : null,
      };
    })
    .filter((x) => x.start !== "");
}

// 初上市、初上櫃的股票掛牌前已經在興櫃交易，用興櫃價當參考價；上市那天起才是正式市價。
export const isNewListing = (l: Lottery) => l.market.startsWith("初");
export const priceLabel = (l: Lottery, today: string) => (isNewListing(l) && !(l.listing !== "" && today >= l.listing) ? "興櫃價" : "市價");

export type Phase = "open" | "soon" | "drawn";

export function phaseOf(l: Lottery, today: string): Phase | null {
  if (today < l.start) return "soon";
  if (today <= l.end) return "open";
  // 申購結束到抽籤後兩週：等抽籤或剛抽完
  const days = (new Date(today).getTime() - new Date(l.draw).getTime()) / 86_400_000;
  return days <= 14 ? "drawn" : null;
}

export interface Verdict {
  gain: number | null; // 抽中一次、上市當天用現在價格賣掉大約賺多少
  pct: number | null; // 溢價差 %
  cost: number | null; // 要先放在帳戶裡的錢
  breakEven: number | null; // 中籤率要高於幾 % 才划算
  word: string;
  tone: "good" | "meh" | "bad" | "unknown";
}

export function judge(l: Lottery, marketPrice: number | null): Verdict {
  const cost = l.price !== null ? Math.round(l.price * l.shares) : null;
  if (l.price === null || marketPrice === null) {
    return { gain: null, pct: null, cost, breakEven: null, word: "暫時查不到市價", tone: "unknown" };
  }
  const gain = Math.round((marketPrice - l.price) * l.shares);
  const pct = ((marketPrice - l.price) / l.price) * 100;
  const net = gain - WIN_FEE;
  const breakEven = net > 0 ? (FEE / net) * 100 : null;
  if (net <= 0) return { gain, pct, cost, breakEven, word: "別抽：市價沒有比承銷價高", tone: "bad" };
  // 從抽籤到掛牌還有一週，價差太薄容易被跌掉。
  if (pct < 15 || gain < 10000) return { gain, pct, cost, breakEven, word: "價差薄，可抽可不抽", tone: "meh" };
  return { gain, pct, cost, breakEven, word: "值得抽", tone: "good" };
}
