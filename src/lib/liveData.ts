// 伺服器端：抓看市場數字卡要用的 FRED 數列，整理成手機好畫的週資料。
import { getSeries } from "@/lib/fred";
import { applyTransform, Observation } from "@/lib/macro";
import { TILES, prepare } from "@/lib/live";

export type LiveSeries = Record<string, Observation[] | null>;

export async function getLiveSeries(ids: string[]): Promise<LiveSeries> {
  const raws = await Promise.all(ids.map((id) => getSeries(id)));
  const out: LiveSeries = {};
  ids.forEach((id, i) => {
    const tile = TILES.find((t) => t.id === id);
    const raw = raws[i];
    out[id] = raw && tile ? prepare(raw, tile.transform) : raw;
  });
  return out;
}

// 景氣時鐘用工廠生產年增（月資料）。
export async function getIndproYoy(): Promise<Observation[] | null> {
  const raw = await getSeries("INDPRO");
  return raw ? applyTransform(raw, "yoyPct") : null;
}
