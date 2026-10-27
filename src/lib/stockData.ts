import { cacheLife } from "next/cache";
import { fm } from "./pickData";
import type { InstRow } from "./pick";
import { epsSummary, instSummary, parseEps, peBand, quadrant, revenueYoy } from "./stock";

export interface StockView {
  code: string;
  name: string;
  industry: string;
  price: { close: number; date: string; change: number | null } | null;
  inst: ReturnType<typeof instSummary>;
  eps: ReturnType<typeof epsSummary>;
  revenue: ReturnType<typeof revenueYoy>;
  pe: ReturnType<typeof peBand>;
  verdict: ReturnType<typeof quadrant>;
  /** 哪些資料抓不到，頁面上要寫出來 */
  missing: string[];
}

// 查一檔：一次抓公司名、十天股價、二十天法人、三年財報、三年月營收、五年本益比。
// 任何一份抓不到都不擋整頁，只在 missing 裡記下來。
export async function getStock(code: string): Promise<StockView | { error: string }> {
  "use cache";
  const missing: string[] = [];
  const grab = async <T,>(label: string, p: Promise<T>): Promise<T | null> => {
    try {
      return await p;
    } catch {
      missing.push(label);
      return null;
    }
  };
  const [info, price, inst, fs, rev, per] = await Promise.all([
    grab("公司名稱", fm("TaiwanStockInfo", code, 30)),
    grab("股價", fm("TaiwanStockPrice", code, 20)),
    grab("法人買賣超", fm("TaiwanStockInstitutionalInvestorsBuySell", code, 25)),
    grab("財報 EPS", fm("TaiwanStockFinancialStatements", code, 3 * 365)),
    grab("月營收", fm("TaiwanStockMonthRevenue", code, 3 * 365)),
    grab("本益比", fm("TaiwanStockPER", code, 5 * 365)),
  ]);
  if (!info && !price && !inst) {
    cacheLife("seconds");
    return { error: "這個股號抓不到資料，確認一下有沒有打錯。" };
  }
  cacheLife("hours");
  const row = info?.[0];
  const bars = (price ?? []).map((r) => ({ date: String(r.date), close: Number(r.close) })).sort((a, b) => b.date.localeCompare(a.date));
  const eps = epsSummary(parseEps((fs ?? []) as { date: string; type: string; value: number }[]));
  const revenue = revenueYoy((rev ?? []) as { revenue_year: number; revenue_month: number; revenue: number }[]);
  const pe = peBand((per ?? []) as { date: string; PER: number }[]);
  return {
    code,
    name: row ? String(row.stock_name ?? code) : code,
    industry: row ? String(row.industry_category ?? "") : "",
    price: bars.length ? { close: bars[0].close, date: bars[0].date, change: bars[1] && bars[1].close > 0 ? (bars[0].close / bars[1].close - 1) * 100 : null } : null,
    inst: instSummary((inst ?? []) as unknown as InstRow[]),
    eps,
    revenue,
    pe,
    verdict: quadrant(eps, revenue, pe),
    missing,
  };
}
