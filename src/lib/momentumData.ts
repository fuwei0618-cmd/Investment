import {
  marketOk,
  MOMENTUM_N,
  MOMENTUM_UNIVERSE,
  rankMomentum,
} from "./momentum";
import { getUsBars } from "./usData";

/** 動能名單：台股用雅虎的「代號.TW」一年日 K，大盤用 ^TWII */
export async function getMomentum() {
  const codes = Object.keys(MOMENTUM_UNIVERSE);
  const raw = await getUsBars([...codes.map((c) => `${c}.TW`), "^TWII"]);
  const bars = Object.fromEntries(codes.map((c) => [c, raw[`${c}.TW`] ?? []]));
  const ranked = rankMomentum(bars);
  const index = raw["^TWII"] ?? [];
  if (!ranked.length) return { error: "抓不到台股一年的股價" } as const;
  return {
    date: index.at(-1)?.date ?? "",
    market: marketOk(index),
    picks: ranked.slice(0, MOMENTUM_N),
    count: ranked.length,
  };
}
