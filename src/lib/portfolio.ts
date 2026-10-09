// 持股與 ETF 健檢：平均成本法計算部位，依王伯達的「高風險 / 防禦」分類算配置比例。

export type Market = "TW" | "US";
export type AssetClass = "stock" | "reit" | "bond" | "cash" | "commodity" | "crypto";

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  stock: "股票",
  reit: "REITs",
  bond: "投資級債",
  cash: "現金",
  commodity: "原物料/黃金",
  crypto: "加密貨幣",
};

// 王伯達 4-1：防禦資產只有高評等投資級債（與現金）；高收益債視同股票。
export const DEFENSIVE: AssetClass[] = ["bond", "cash"];

export interface Trade {
  id: string;
  date: string;
  market: Market;
  symbol: string;
  name: string;
  side: "buy" | "sell";
  price: number;
  qty: number;
  fee: number;
  assetClass: AssetClass;
  reason: string; // CodeGym 8-1 投資日誌欄位
}

export interface Position {
  market: Market;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  qty: number;
  avgCost: number; // 原幣
  realized: number; // 原幣
}

export function buildPositions(trades: Trade[]): Position[] {
  const map = new Map<string, Position>();
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  for (const t of sorted) {
    const key = `${t.market}:${t.symbol.toUpperCase()}`;
    const p = map.get(key) ?? {
      market: t.market,
      symbol: t.symbol.toUpperCase(),
      name: t.name,
      assetClass: t.assetClass,
      qty: 0,
      avgCost: 0,
      realized: 0,
    };
    if (t.side === "buy") {
      const cost = p.avgCost * p.qty + t.price * t.qty + t.fee;
      p.qty += t.qty;
      p.avgCost = p.qty > 0 ? cost / p.qty : 0;
    } else {
      const qty = Math.min(t.qty, p.qty);
      p.realized += (t.price - p.avgCost) * qty - t.fee;
      p.qty -= qty;
      if (p.qty === 0) p.avgCost = 0;
    }
    p.name = t.name || p.name;
    p.assetClass = t.assetClass;
    map.set(key, p);
  }
  return [...map.values()];
}

// 王伯達 1-4、4-2：依年齡建議的高風險資產比例。
export function suggestedRiskRatio(age: number) {
  if (age < 40) return 0.8;
  if (age < 55) return 0.75;
  if (age < 65) return 0.65;
  return 0.6;
}

// CodeGym 9-1：單一持股超過 20% 視為集中風險。
export const CONCENTRATION_LIMIT = 0.2;
