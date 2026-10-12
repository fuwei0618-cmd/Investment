// M平方〈總經X產業X個股〉「動態投資思維羅盤」8 步的計算邏輯；白話內容在 compassData.ts。
import type { PhaseKey } from "@/lib/industry";

// Step 3：以「經濟成長、物價水準相對長期平均」決定象限。
// 長期平均為自訂近似值：美國實質 GDP 年增約 2%、CPI 年增約 2.5%（2000 年以來）。
export const GROWTH_AVG = 2;
export const INFLATION_AVG = 2.5;

export function estimatePhase(growthYoy: number, inflationYoy: number): PhaseKey {
  const growthUp = growthYoy >= GROWTH_AVG;
  const priceUp = inflationYoy >= INFLATION_AVG;
  if (growthUp) return priceUp ? "expansion" : "recovery";
  return priceUp ? "slowdown" : "recession";
}

// Step 4：羅盤各象限的產業方向（對應 compassData 的 NEED_SECTORS.sector）。
export const PHASE_SECTORS: Record<PhaseKey, { focus: string; sectors: string[] }> = {
  expansion: { focus: "EPS 延續產業", sectors: ["科技", "房地產", "非必需消費", "工業"] },
  slowdown: { focus: "抗通膨、高殖利率", sectors: ["必需消費", "醫療保健", "公用事業", "能源"] },
  recession: { focus: "降低持股水位", sectors: ["必需消費", "醫療保健"] },
  recovery: {
    focus: "EPS 快速成長（全產業）",
    sectors: ["科技", "非必需消費", "能源", "工業", "金融", "原材料"],
  },
};

// 產業名稱比對：「科技」對到「資訊科技」；不能用包含比對，否則「必需消費」會誤中「非必需消費」。
export function sectorFits(picked: string[], sector: string) {
  return picked.some((s) => s === sector || (s === "科技" && sector === "資訊科技"));
}

// Step 7：依獲利紀錄與營收成長選評價方式。
export type ValuationMethod = "pe" | "pb" | "ps";

export const METHOD_LABEL: Record<ValuationMethod, { name: string; perShare: string; multiple: string }> = {
  pe: { name: "本益比", perShare: "預估每股盈餘（EPS）", multiple: "合理本益比" },
  pb: { name: "股價淨值比", perShare: "預估每股淨值", multiple: "合理股價淨值比" },
  ps: { name: "股價營收比", perShare: "預估每股營收", multiple: "合理股價營收比" },
};

export function pickMethod(o: { profitable3y: boolean; assetBased: boolean; revenueGrowth: number }): ValuationMethod {
  if (o.profitable3y) return o.assetBased ? "pb" : "pe";
  return o.revenueGrowth > 20 ? "ps" : "pb";
}

// Step 8：潛在報酬 = 目標價 / 股價 − 1，與預期報酬率比較。
export function decide(target: number, price: number, expectedReturnPct: number) {
  const upside = Math.round((target / price - 1) * 1000) / 10; // 取到 0.1%，避免浮點誤差把「相等」判成高低
  const verdict = upside > expectedReturnPct ? "buy" : upside < expectedReturnPct ? "sell" : "hold";
  return { upside, verdict } as const;
}

// 羅盤用到的 FRED 數列要怎麼顯示：月增、年增或原值。
type Obs = { date: string; value: number };
type View = { label: string; unit: string; calc: (s: Obs[]) => number | null };

const level = (s: Obs[]) => s.at(-1)?.value ?? null;
export const yoyPct = (s: Obs[]) => {
  const last = s.at(-1);
  if (!last) return null;
  const t = new Date(last.date);
  t.setFullYear(t.getFullYear() - 1);
  const target = t.toISOString().slice(0, 10);
  const prev = [...s].reverse().find((o) => o.date <= target);
  return prev ? (last.value / prev.value - 1) * 100 : null;
};

export const FRED_VIEW: Record<string, View> = {
  PAYEMS: {
    label: "上月新增",
    unit: "萬人",
    calc: (s) => (s.length >= 2 ? (s.at(-1)!.value - s.at(-2)!.value) / 10 : null), // 千人 → 萬人
  },
  ICSA: { label: "每週", unit: "萬人", calc: (s) => (s.length ? s.at(-1)!.value / 10_000 : null) },
  RSAFS: { label: "年增", unit: "%", calc: yoyPct },
  UMCSENT: { label: "指數", unit: "", calc: level },
  FEDFUNDS: { label: "利率", unit: "%", calc: level },
  PCEPILFE: { label: "年增", unit: "%", calc: yoyPct },
  T10YIE: { label: "預期", unit: "%", calc: level },
  DFII10: { label: "利率", unit: "%", calc: level },
  WALCL: { label: "規模年增", unit: "%", calc: yoyPct },
  DTWEXBGS: { label: "年增", unit: "%", calc: yoyPct },
  GDPC1: { label: "年增", unit: "%", calc: yoyPct },
  CPIAUCSL: { label: "年增", unit: "%", calc: yoyPct },
  UNRATE: { label: "失業率", unit: "%", calc: level },
  T10Y2Y: { label: "利差", unit: "%", calc: level },
  BAMLH0A0HYM2: { label: "利差", unit: "%", calc: level },
};
