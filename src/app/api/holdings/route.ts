import type { NextRequest } from "next/server";
import type { Holding } from "@/lib/desk";
import { lineReady } from "@/lib/line";
import {
  HOLDINGS_KEY,
  passOk,
  save,
  storeReady,
  US_HOLDINGS_KEY,
} from "@/lib/store";

// 設定好了沒（不回傳任何持股資料）
export async function GET() {
  return Response.json({
    line: lineReady(),
    store: storeReady(),
    pass: !!process.env.PUSH_PASSCODE,
  });
}

const clean = (list: unknown, code: RegExp): Holding[] =>
  (Array.isArray(list) ? (list as Holding[]) : [])
    .filter((t) => code.test(String(t.code)))
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

// 把瀏覽器裡的台股、美股持股同步到雲端，給 LINE 提醒用
export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    pass?: string;
    trades?: unknown;
    usTrades?: unknown;
  } | null;
  if (!passOk(body?.pass))
    return Response.json({ error: "通關密語不對" }, { status: 401 });
  if (!storeReady())
    return Response.json({ error: "雲端倉庫還沒接上" }, { status: 503 });
  const tw = clean(body?.trades, /^[0-9A-Z]{4,6}$/);
  await save(HOLDINGS_KEY, tw);
  // 舊版網頁沒傳美股就不要把雲端的美股清掉
  if (body && "usTrades" in body)
    await save(US_HOLDINGS_KEY, clean(body.usTrades, /^[A-Z][A-Z.-]{0,5}$/));
  return Response.json({ saved: tw.length });
}
