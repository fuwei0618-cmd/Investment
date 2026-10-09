import type { NextRequest } from "next/server";

// 收盤價：台股走 FinMind（課程使用，免金鑰可用、有金鑰額度較高）；美股走 FMP（需 FMP_API_KEY）。
export async function GET(request: NextRequest) {
  const market = request.nextUrl.searchParams.get("market");
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();
  if (!symbol || !/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
    return Response.json({ error: "代號格式不正確" }, { status: 400 });
  }
  try {
    if (market === "TW") return Response.json(await twQuote(symbol));
    if (market === "US") return Response.json(await usQuote(symbol));
    return Response.json({ error: "market 需為 TW 或 US" }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "查詢失敗" }, { status: 502 });
  }
}

async function twQuote(symbol: string) {
  const start = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
  const url = new URL("https://api.finmindtrade.com/api/v4/data");
  url.searchParams.set("dataset", "TaiwanStockPrice");
  url.searchParams.set("data_id", symbol);
  url.searchParams.set("start_date", start);
  const headers: HeadersInit = process.env.FINMIND_TOKEN
    ? { Authorization: `Bearer ${process.env.FINMIND_TOKEN}` }
    : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`FinMind 回應 ${res.status}`);
  const json = (await res.json()) as { data?: { date: string; close: number }[] };
  const last = json.data?.at(-1);
  if (!last) throw new Error("FinMind 查無資料");
  return { symbol, price: last.close, currency: "TWD", date: last.date };
}

async function usQuote(symbol: string) {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("尚未設定 FMP_API_KEY，請手動輸入價格");
  const url = new URL("https://financialmodelingprep.com/stable/quote");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("apikey", key);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FMP 回應 ${res.status}`);
  const json = (await res.json()) as { price: number; timestamp?: number }[];
  const q = json[0];
  if (!q) throw new Error("FMP 查無資料");
  const date = q.timestamp ? new Date(q.timestamp * 1000).toISOString().slice(0, 10) : "";
  return { symbol, price: q.price, currency: "USD", date };
}
