import { cacheLife } from "next/cache";
import { Observation, parseFredCsv } from "@/lib/macro";

// FRED 公開 CSV（免金鑰）。成功快取數小時；失敗只快取數秒，避免把錯誤結果留太久。
export async function getSeries(id: string): Promise<Observation[] | null> {
  "use cache";
  const start = new Date(Date.now() - 3 * 365 * 86_400_000).toISOString().slice(0, 10);
  try {
    const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=${start}`);
    if (!res.ok) throw new Error(String(res.status));
    const obs = parseFredCsv(await res.text());
    if (obs.length === 0) throw new Error("empty");
    cacheLife("hours");
    return obs;
  } catch {
    cacheLife("seconds");
    return null;
  }
}
