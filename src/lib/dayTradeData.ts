import { cacheLife } from "next/cache";
import { parseDayTrade, parseMis, parseVolumes, type HotRow } from "./dayTrade";

const twse = () => process.env.TWSE_BASE ?? "https://www.twse.com.tw";

async function text(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
}

const ymd = (d: Date) =>
  new Date(d.getTime() + 8 * 3600_000)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

// 昨天（最近一個交易日）當沖最熱的股票：證交所當日沖銷交易標的＋每日收盤行情的成交量。往回找最多 6 天
export async function getDayTradeHot(): Promise<
  { date: string; rows: HotRow[] } | { error: string }
> {
  "use cache";
  try {
    const vol = parseVolumes(
      await text(`${twse()}/rwd/zh/afterTrading/STOCK_DAY_ALL?response=json`),
    );
    for (let i = 0; i < 6; i++) {
      const date = ymd(new Date(Date.now() - i * 86_400_000));
      const t = await text(
        `${twse()}/rwd/zh/dayTrading/TWTB4U?response=json&date=${date}&selectType=All`,
      ).catch(() => "");
      const rows = t ? parseDayTrade(t, vol) : [];
      if (rows.length) {
        cacheLife("hours");
        return {
          date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`,
          rows,
        };
      }
    }
    throw new Error("找不到最近的當沖資料");
  } catch (e) {
    cacheLife("seconds");
    return { error: e instanceof Error ? e.message : "失敗" };
  }
}

// 盤中即時報價：證交所基本市況報導。上市、上櫃都問一次，對方只回存在的那個。MIS_BASE 只給本機測試用
export async function getLive(codes: string[]) {
  const ex = codes.flatMap((c) => [`tse_${c}.tw`, `otc_${c}.tw`]).join("|");
  const url = `${process.env.MIS_BASE ?? "https://mis.twse.com.tw"}/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(ex)}&json=1&delay=0&_=${Date.now()}`;
  const res = await fetch(url, {
    headers: {
      Referer: "https://mis.twse.com.tw/stock/index.jsp",
      "User-Agent": "Mozilla/5.0",
    },
    signal: AbortSignal.timeout(6000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`證交所即時報價回應 ${res.status}`);
  return parseMis(await res.json());
}
