import { cacheLife } from "next/cache";
import { parseIndustry, parseInstitutional, parseMargin, parsePrices, parseStreets, type Street } from "./chips";

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

// 大戶逛街地圖：證交所三大法人日報（不給日期就是最新一天）＋證交所每日收盤價＋FinMind 公司產業別。
// 每一份都限時八秒；失敗時回傳卡在哪一步，頁面上會寫出來，方便知道是哪個資料源出問題。TWSE_BASE 只給本機測試用。
export async function getStreets(): Promise<{ date: string; streets: Street[] } | { error: string }> {
  "use cache";
  const base = process.env.TWSE_BASE ?? "https://www.twse.com.tw";
  const get = async (step: string, url: string, init?: RequestInit, text = false) => {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) }); // 慢的時候不要拖垮整頁
      if (!res.ok) throw new Error(String(res.status));
      return text ? await res.text() : await res.json();
    } catch (e) {
      throw new Error(`${step}（${e instanceof Error ? e.message : "失敗"}）`);
    }
  };
  try {
    const fm = new URL(`${process.env.FINMIND_BASE ?? "https://api.finmindtrade.com"}/api/v4/data`);
    fm.searchParams.set("dataset", "TaiwanStockInfo");
    const headers: HeadersInit = process.env.FINMIND_TOKEN ? { Authorization: `Bearer ${process.env.FINMIND_TOKEN}` } : {};
    const [t86, prices, info] = await Promise.all([
      get("法人日報", `${base}/rwd/zh/fund/T86?selectType=ALLBUT0999&response=json`),
      get("收盤價", `${base}/rwd/zh/afterTrading/STOCK_DAY_ALL?response=json`, undefined, true),
      get("產業別", fm.toString(), { headers }),
    ]);
    if (t86.stat !== "OK") throw new Error(`法人日報（${t86.stat}）`);
    const streets = parseStreets(t86, parsePrices(prices), parseIndustry(info.data ?? []));
    if (streets.length === 0) throw new Error("對不上價格");
    cacheLife("hours");
    const d = String(t86.date ?? "");
    return { date: d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d, streets };
  } catch (e) {
    cacheLife("seconds");
    return { error: e instanceof Error ? e.message : "失敗" };
  }
}
