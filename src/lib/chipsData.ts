import { cacheLife } from "next/cache";
import { parseInstitutional, parseMargin } from "./chips";

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
