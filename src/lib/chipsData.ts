import { cacheLife } from "next/cache";
import { parseInstitutional, parseMargin, parseStreets, type Street } from "./chips";

// 從 FinMind 抓整個台股的三大法人買賣和融資。FINMIND_BASE 只給本機測試指向假資料用。
async function finmind(dataset: string, days: number) {
  const url = new URL(`${process.env.FINMIND_BASE ?? "https://api.finmindtrade.com"}/api/v4/data`);
  url.searchParams.set("dataset", dataset);
  url.searchParams.set("start_date", new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10));
  const headers: HeadersInit = process.env.FINMIND_TOKEN ? { Authorization: `Bearer ${process.env.FINMIND_TOKEN}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(String(res.status));
  const data = ((await res.json()) as { data?: unknown[] }).data;
  if (!data?.length) throw new Error("empty");
  return data;
}

export async function getChips() {
  "use cache";
  try {
    const [inst, margin] = await Promise.all([
      finmind("TaiwanStockTotalInstitutionalInvestors", 30),
      finmind("TaiwanStockTotalMarginPurchaseShortSale", 10).catch(() => []),
    ]);
    cacheLife("hours");
    return {
      days: parseInstitutional(inst as Parameters<typeof parseInstitutional>[0]).slice(-10),
      margin: parseMargin(margin as Parameters<typeof parseMargin>[0]),
    };
  } catch {
    cacheLife("seconds");
    return null;
  }
}

// 大戶逛街地圖：證交所三大法人日報（不給日期就是最新一天）＋每檔收盤價＋公司產業別。TWSE_BASE / TWSE_OPENAPI 只給本機測試用。
export async function getStreets(): Promise<{ date: string; streets: Street[] } | null> {
  "use cache";
  try {
    const base = process.env.TWSE_BASE ?? "https://www.twse.com.tw";
    const open = process.env.TWSE_OPENAPI ?? "https://openapi.twse.com.tw";
    const get = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    };
    const [t86, prices, companies] = await Promise.all([
      get(`${base}/rwd/zh/fund/T86?selectType=ALLBUT0999&response=json`),
      get(`${open}/v1/exchangeReport/STOCK_DAY_ALL`),
      get(`${open}/v1/opendata/t187ap03_L`),
    ]);
    if (t86.stat !== "OK") throw new Error(String(t86.stat));
    const streets = parseStreets(t86, prices, companies);
    if (streets.length === 0) throw new Error("empty");
    cacheLife("hours");
    const d = String(t86.date ?? "");
    return { date: d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d, streets };
  } catch {
    cacheLife("seconds");
    return null;
  }
}
