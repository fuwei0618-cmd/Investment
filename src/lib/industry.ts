// M平方〈總經X產業X個股〉3-1 五大產業觀察指標、1-1／5-1 產業三大要領。
import { Indicator, Observation } from "@/lib/macro";

export type PhaseKey = "expansion" | "slowdown" | "recession" | "recovery";

export interface AutoSignal {
  id: string; // FRED series id
  label: string;
  transform?: Indicator["transform"];
  unit: string;
  // 回傳 true = 對此產業有利、false = 不利
  judge: (series: Observation[]) => { favorable: boolean; text: string };
}

export interface Sector {
  key: string;
  name: string;
  members: string;
  traits: string;
  indicators: string[];
  timing: string;
  etf: string;
  phases: PhaseKey[];
  auto: AutoSignal;
}

// 往前找約 n 天前的觀測值，用來判斷方向
export function valueDaysAgo(series: Observation[], days: number) {
  const last = series.at(-1);
  if (!last) return undefined;
  const t = new Date(last.date).getTime() - days * 86_400_000;
  for (let i = series.length - 1; i >= 0; i--) {
    if (new Date(series[i].date).getTime() <= t) return series[i].value;
  }
  return undefined;
}

export const SECTORS: Sector[] = [
  {
    key: "defensive",
    name: "防禦型",
    members: "必需消費、醫療保健、公用事業",
    traits: "低本益比、高殖利率",
    indicators: [
      "循環股預估 EPS − 防禦股預估 EPS 差值收窄",
      "MM 製造業週期指數下行",
      "央行為抗通膨而升息",
    ],
    timing: "製造業下行、趨緩或衰退",
    etf: "XLP、XLV、XLU",
    phases: ["slowdown", "recession"],
    auto: {
      id: "FEDFUNDS",
      label: "聯邦基金利率（近 6 個月變化）",
      unit: "%",
      judge: (s) => {
        const prev = valueDaysAgo(s, 180);
        const diff = prev === undefined ? 0 : s.at(-1)!.value - prev;
        return diff >= 0.25
          ? { favorable: true, text: `升息中（+${diff.toFixed(2)}）` }
          : { favorable: false, text: `未升息（${diff >= 0 ? "+" : ""}${diff.toFixed(2)}）` };
      },
    },
  },
  {
    key: "discretionary",
    name: "非必需消費",
    members: "汽車、零售、旅遊、娛樂",
    traits: "高本益比、低殖利率",
    indicators: ["製造業週期：上升期汽車股 +33.8%（大盤 +22.3%），下降期 −16.3%"],
    timing: "製造業上行、復甦或擴張",
    etf: "XLY",
    phases: ["expansion", "recovery"],
    auto: {
      id: "INDPRO",
      label: "美國工業生產年增（製造業週期近似）",
      transform: "yoyPct",
      unit: "%",
      judge: (s) =>
        s.at(-1)!.value > 0
          ? { favorable: true, text: "製造業上行" }
          : { favorable: false, text: "製造業下行" },
    },
  },
  {
    key: "energy",
    name: "能源",
    members: "石油、天然氣、設備服務",
    traits: "抗通膨、高殖利率、低本益比",
    indicators: [
      "原油庫存年增率向下時有支撐",
      "鑽油井數與設備服務股資本支出（上升初期）",
      "終端油品消費量與裂解價差",
    ],
    timing: "復甦期、抗通膨環境",
    etf: "XLE",
    phases: ["recovery", "slowdown"],
    auto: {
      id: "WCESTUS1",
      label: "美國原油庫存年增（不含戰略儲備）",
      transform: "yoyPct",
      unit: "%",
      judge: (s) =>
        s.at(-1)!.value < 0
          ? { favorable: true, text: "庫存下降，有支撐" }
          : { favorable: false, text: "庫存上升" },
    },
  },
  {
    key: "financial",
    name: "金融",
    members: "銀行、保險、券商",
    traits: "高波動、低估值、高殖利率",
    indicators: [
      "製造業週期指數與企業放貸利差",
      "信用風險利差與信貸違約率",
      "長短利差擴大",
    ],
    timing: "製造業上行且利差擴大",
    etf: "XLF",
    phases: ["recovery", "expansion"],
    auto: {
      id: "T10Y2Y",
      label: "10Y − 2Y 利差（近 3 個月變化）",
      unit: "%",
      judge: (s) => {
        const prev = valueDaysAgo(s, 90);
        const diff = prev === undefined ? 0 : s.at(-1)!.value - prev;
        return diff > 0
          ? { favorable: true, text: `利差擴大（+${diff.toFixed(2)}）` }
          : { favorable: false, text: `利差收窄（${diff.toFixed(2)}）` };
      },
    },
  },
  {
    key: "tech",
    name: "科技",
    members: "半導體、軟體、硬體",
    traits: "高估值、低殖利率",
    indicators: [
      "通膨與估值：通膨明顯上升時表現弱",
      "製造業週期與半導體出貨年增",
      "台灣電子零組件出口與台灣 PMI 新訂單",
    ],
    timing: "通膨溫和且製造業重啟",
    etf: "XLK、SOXX",
    phases: ["expansion", "recovery"],
    auto: {
      id: "CPIAUCSL",
      label: "美國 CPI 年增",
      transform: "yoyPct",
      unit: "%",
      judge: (s) =>
        s.at(-1)!.value > 3
          ? { favorable: false, text: "通膨偏高（> 3%）" }
          : { favorable: true, text: "通膨溫和" },
    },
  },
];

// 三大要領：潛在市場、進入門檻、競爭態勢
export interface IndustryCheck {
  id: string;
  name: string;
  growth: number | null; // 未來 3 年年均成長率 %
  barriers: { material: boolean; tech: boolean; platform: boolean };
  top1: number | null; // 第一大市占 %
  top3: number | null; // 前三大合計市占 %
  note: string;
}

export function evaluateIndustry(c: IndustryCheck) {
  const market = c.growth !== null && c.growth > 10;
  const barrier = c.barriers.material || c.barriers.tech || c.barriers.platform;
  const monopoly = c.top1 !== null && c.top1 > 50;
  const oligopoly = c.top3 !== null && c.top3 > 50;
  const competition = monopoly || oligopoly;
  return {
    market,
    barrier,
    competition,
    competitionLabel: monopoly ? "獨佔" : oligopoly ? "寡占" : "競爭分散",
    passed: [market, barrier, competition].filter(Boolean).length,
  };
}
