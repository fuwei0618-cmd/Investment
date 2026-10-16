// 雲端小倉庫（Upstash Redis，Vercel 的 Storage 一鍵接上）：只放 LINE 盤後提醒要用的持股清單。
const url = () =>
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = () =>
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const storeReady = () => !!(url() && token());

async function run(cmd: string[]) {
  const res = await fetch(url()!, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`倉庫 ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

export async function load<T>(key: string, fallback: T): Promise<T> {
  const v = await run(["GET", key]);
  return typeof v === "string" ? (JSON.parse(v) as T) : fallback;
}

export async function save(key: string, value: unknown) {
  await run(["SET", key, JSON.stringify(value)]);
}

export const HOLDINGS_KEY = "holdings.v1";
export const US_HOLDINGS_KEY = "us.holdings.v1";

/** 通關密語：沒設 PUSH_PASSCODE 就不讓人寫入或測試，避免別人亂用 */
export const passOk = (p: unknown) =>
  !!process.env.PUSH_PASSCODE && p === process.env.PUSH_PASSCODE;
