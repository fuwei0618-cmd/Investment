import type { NextRequest } from "next/server";
import type { Holding } from "@/lib/desk";
import { lineReady } from "@/lib/line";
import { HOLDINGS_KEY, passOk, save, storeReady } from "@/lib/store";

// 設定好了沒（不回傳任何持股資料）
export async function GET() {
  return Response.json({
    line: lineReady(),
    store: storeReady(),
    pass: !!process.env.PUSH_PASSCODE,
  });
}

// 把瀏覽器裡的持股同步到雲端，給盤後檢查用
export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    pass?: string;
    trades?: Holding[];
  } | null;
  if (!passOk(body?.pass))
    return Response.json({ error: "通關密語不對" }, { status: 401 });
  if (!storeReady())
    return Response.json({ error: "雲端倉庫還沒接上" }, { status: 503 });
  const trades = (Array.isArray(body?.trades) ? body.trades : [])
    .filter((t) => /^[0-9A-Z]{4,6}$/.test(String(t.code)))
    .slice(0, 30)
    .map((t) => ({
      saved: String(t.saved),
      code: String(t.code),
      name: String(t.name).slice(0, 20),
      price: Number(t.price),
      shares: Number(t.shares),
      stop: Number(t.stop),
      target: Number(t.target),
    }));
  await save(HOLDINGS_KEY, trades);
  return Response.json({ saved: trades.length });
}
