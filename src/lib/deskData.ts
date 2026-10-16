import { cacheLife } from "next/cache";
import { aboveMonthLine } from "./pick";
import { fm, toNews, type News } from "./pickData";

/** 加權指數最近收盤、月線、比前一天漲跌 */
export async function getTaiex() {
  "use cache";
  try {
    const rows = await fm("TaiwanStockPrice", "TAIEX", 45);
    const closes = rows
      .map((r) => ({ date: String(r.date), close: Number(r.close) }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const m = aboveMonthLine(closes.map((c) => ({ ...c, max: 0, volume: 0 })));
    if (!m) throw new Error("資料不夠");
    cacheLife("hours");
    const prev = closes.at(-2)?.close ?? null;
    return {
      ...m,
      date: closes.at(-1)!.date,
      change: prev ? m.close / prev - 1 : null,
    };
  } catch {
    cacheLife("seconds");
    return null;
  }
}

/** 追蹤清單每檔最近三天的新聞（每檔最多 3 則） */
export async function getNews(code: string): Promise<News[]> {
  "use cache";
  try {
    const rows = await fm("TaiwanStockNews", code, 3);
    cacheLife("hours");
    return toNews(rows).slice(0, 3);
  } catch {
    cacheLife("seconds");
    return [];
  }
}
