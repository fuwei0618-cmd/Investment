// M平方〈總經〉4-1「十張圖」與〈總經X產業X個股〉2-2 的景氣反轉指標。
// 能從 FRED（聖路易聯儲）免費取得的先自動化；其餘列出待接資料源。

export type Signal = "ok" | "warn" | "neutral";

export interface Observation {
  date: string;
  value: number;
}

export interface Indicator {
  id: string; // FRED series id
  title: string;
  unit: string;
  source: string;
  rule: string;
  transform?: "yoyDiff" | "yoyPct";
  judge: (latest: number) => { signal: Signal; text: string };
}

export const INDICATORS: Indicator[] = [
  {
    id: "T10Y2Y",
    title: "美債 10Y − 2Y 利差",
    unit: "%",
    source: "總經 3-7、4-1 圖 1",
    rule: "翻負（倒掛）代表景氣將見頂",
    judge: (v) => (v < 0 ? { signal: "warn", text: "倒掛中" } : { signal: "ok", text: "未倒掛" }),
  },
  {
    id: "T10Y3M",
    title: "美債 10Y − 3M 利差",
    unit: "%",
    source: "王伯達 4-7、產業 2-2",
    rule: "月底翻負後 8–16 個月歷來皆出現衰退；王伯達策略：倒掛時分批轉向公債",
    judge: (v) => (v < 0 ? { signal: "warn", text: "倒掛中" } : { signal: "ok", text: "未倒掛" }),
  },
  {
    id: "PAYEMS",
    title: "非農就業年增",
    unit: "萬人",
    source: "總經 4-1 圖 2",
    rule: "年增低於 200 萬且持續下滑，約領先美股反轉 2–3 個月",
    transform: "yoyDiff",
    judge: (v) => (v < 200 ? { signal: "warn", text: "低於 200 萬" } : { signal: "ok", text: "高於 200 萬" }),
  },
  {
    id: "SAHMREALTIME",
    title: "薩姆規則",
    unit: "%",
    source: "產業 2-2、5-2",
    rule: "失業率 3 個月均值高出 12 個月低點 0.5% 以上，衰退機率大增",
    judge: (v) => (v >= 0.5 ? { signal: "warn", text: "已觸發" } : { signal: "ok", text: "未觸發" }),
  },
  {
    id: "BAMLH0A0HYM2",
    title: "高收益債信用利差",
    unit: "%",
    source: "總經 4-1 圖 6",
    rule: "課程以高收益債殖利率 − 10Y 超過 10% 為警戒；此處用 ICE 高收益債 OAS 近似",
    judge: (v) => (v > 10 ? { signal: "warn", text: "高於 10%" } : { signal: "ok", text: "低於 10%" }),
  },
  {
    id: "DCOILWTICO",
    title: "WTI 油價",
    unit: "美元",
    source: "總經 3-6、4-1 圖 9",
    rule: "45–60 美元為有利區間；高於 60 有通膨壓力、低於 45 代表需求出問題（2019 年門檻，僅供參考）",
    judge: (v) =>
      v > 60
        ? { signal: "warn", text: "高於 60，通膨壓力" }
        : v < 45
          ? { signal: "warn", text: "低於 45，需求疑慮" }
          : { signal: "ok", text: "有利區間" },
  },
  {
    id: "ICSA",
    title: "每週初領失業金年增",
    unit: "%",
    source: "總經 2-3",
    rule: "領先 GDP 約 6–12 個月；年增持續走高代表就業轉弱",
    transform: "yoyPct",
    judge: (v) => (v > 10 ? { signal: "warn", text: "明顯上升" } : { signal: "neutral", text: "持續觀察" }),
  },
];

// 十張圖中尚未自動化的項目（無免費 API 或為 M平方 自有指數）。
export const MANUAL_CHARTS = [
  "諮商局 − 密大消費者信心差距（總經 4-1 圖 3）",
  "美國耐久財新訂單年增 vs 未完成訂單年增（圖 4）",
  "台灣電子零組件出口年增（圖 5）",
  "Fed 銀行放貸調查：企業貸款需求 vs 銀行緊縮（圖 7）",
  "CME FedWatch 升降息機率（圖 8）",
  "MM 全球景氣衰退機率：20% / 50%（圖 10）",
  "ISM 製造業 / 服務業 PMI 與客戶端存貨",
];

export function parseFredCsv(csv: string): Observation[] {
  return csv
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [date, raw] = line.split(",");
      // 缺值在 FRED CSV 裡是 "." 或空字串
      return { date, value: raw === undefined || raw.trim() === "" ? NaN : Number(raw) };
    })
    .filter((o) => o.date && Number.isFinite(o.value));
}

// 以「一年前最接近的觀測值」計算年增，適用月資料與週資料。
export function applyTransform(obs: Observation[], transform?: Indicator["transform"]): Observation[] {
  if (!transform) return obs;
  const out: Observation[] = [];
  let j = 0;
  for (let i = 0; i < obs.length; i++) {
    const target = new Date(obs[i].date);
    target.setFullYear(target.getFullYear() - 1);
    const t = target.toISOString().slice(0, 10);
    while (j + 1 < i && obs[j + 1].date <= t) j++;
    if (obs[j].date > t || i === j) continue;
    const prev = obs[j].value;
    const value =
      transform === "yoyDiff" ? (obs[i].value - prev) / 10 : ((obs[i].value - prev) / prev) * 100; // PAYEMS 單位千人 → 萬人
    out.push({ date: obs[i].date, value });
  }
  return out;
}

// M平方 景氣四象限與資產配置（總經 2-1、2-2、3-7；產業 3-1）。
export const PHASES = [
  {
    key: "expansion",
    name: "擴張",
    yieldCurve: "利差收窄",
    stock: "股優於債，各國股市",
    bond: "減公債；公司債、高收益債、新興市場債可持有",
    fx: "歐元、英鎊等政策型貨幣，出口與原物料型貨幣",
    commodity: "原油",
    sector: "科技、非必需消費",
  },
  {
    key: "slowdown",
    name: "趨緩",
    yieldCurve: "倒掛",
    stock: "調降，若持有只留美股",
    bond: "降低高風險債；末段逢低買美國公債",
    fx: "美元",
    commodity: "原油最後一波",
    sector: "必需消費、醫療保健、公用事業、能源",
  },
  {
    key: "recession",
    name: "衰退",
    yieldCurve: "利差快速擴大",
    stock: "出清",
    bond: "公債",
    fx: "美元、日圓",
    commodity: "黃金",
    sector: "現金最高；持股只選必需消費與醫療",
  },
  {
    key: "recovery",
    name: "復甦",
    yieldCurve: "利差高檔持平",
    stock: "逐步買進新興與成熟市場股（台股第 4 象限歷史勝率 100%）",
    bond: "公債與投資級債，再加碼各類債",
    fx: "新興市場貨幣",
    commodity: "黃金；原物料逢低布局",
    sector: "全產業；金融、能源、原材料可能是黑馬",
  },
] as const;
