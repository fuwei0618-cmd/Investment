// 看市場的動態儀表板：每張數字卡看哪個 FRED 數列、怎麼換算、怎麼判斷紅黃綠。
// 判斷規則多來自 M平方〈15單元看懂經濟運行〉（2019 年錄製，門檻是課程當時的數字）。
import type { Observation } from "./macro";
import { applyTransform } from "./macro";
import type { Light } from "./today";
import type { PhaseKey } from "./industry";

export type Transform = "none" | "yoyPct" | "yoyDiff";

export interface Tile {
  id: string; // FRED 數列
  level: 1 | 2 | 3; // 放在看市場第幾關
  name: string; // 白話名稱
  role?: string; // 在「主人遛狗」或因果鏈裡的角色
  transform: Transform;
  unit: string;
  digits: number;
  lines?: { value: number; label: string }[]; // 圖上的參考線
  judge: (v: number) => Light | null; // null＝看方向，不分紅黃綠
  how: string; // 怎麼看
  course: string; // 出處
}

export const TILES: Tile[] = [
  {
    id: "SP500",
    level: 1,
    name: "美國股市",
    role: "狗",
    transform: "none",
    unit: "點",
    digits: 0,
    judge: () => null,
    how: "股價像被主人牽著散步的狗，跑前跑後，但最後跟著主人（經濟）走。點「疊上主人」比比看。",
    course: "總經 1-1",
  },
  {
    id: "PAYEMS",
    level: 1,
    name: "一年多幾個工作",
    role: "主人",
    transform: "yoyDiff",
    unit: "萬個",
    digits: 0,
    lines: [{ value: 200, label: "200 萬" }],
    judge: (v) => (v < 0 ? "red" : v < 200 ? "yellow" : "green"),
    how: "美國一年新增的工作。低於 200 萬又一直往下，大約 2–3 個月後美股容易轉弱。",
    course: "總經 4-1 圖 2",
  },
  {
    id: "RSAFS",
    level: 1,
    name: "花錢（比去年）",
    transform: "yoyPct",
    unit: "%",
    digits: 1,
    lines: [{ value: 2, label: "2%" }],
    judge: (v) => (v < 0 ? "red" : v < 2 ? "yellow" : "green"),
    how: "美國經濟七成靠消費。零售比去年多不到 2% 就算轉弱。",
    course: "總經 2-3、產業 2-1",
  },
  {
    id: "UMCSENT",
    level: 1,
    name: "消費者心情",
    transform: "none",
    unit: "",
    digits: 1,
    lines: [{ value: 80, label: "80" }],
    judge: (v) => (v < 60 ? "red" : v < 80 ? "yellow" : "green"),
    how: "覺得明天會更好，才敢買車買家電。指數越低大家越悲觀（80 為本站參考線）。",
    course: "總經 4-1 圖 3",
  },
  {
    id: "INDPRO",
    level: 1,
    name: "工廠生產（比去年）",
    transform: "yoyPct",
    unit: "%",
    digits: 1,
    lines: [{ value: 0, label: "0" }],
    judge: (v) => (v < -1 ? "red" : v < 1 ? "yellow" : "green"),
    how: "店裡賣得好，就跟工廠多下單。工廠生產轉負，代表庫存在堆、訂單在減。",
    course: "產業 2-1、總經 2-1",
  },
  {
    id: "FEDFUNDS",
    level: 2,
    name: "央行利率",
    role: "油門／煞車",
    transform: "none",
    unit: "%",
    digits: 2,
    judge: () => null,
    how: "央行降息＝踩油門放錢，升息＝踩煞車收錢。看方向比看數字重要。",
    course: "總經 3-1",
  },
  {
    id: "T10Y2Y",
    level: 2,
    name: "長短利差",
    transform: "none",
    unit: "%",
    digits: 2,
    lines: [{ value: 0, label: "倒掛線" }],
    judge: (v) => (v < 0 ? "red" : v < 0.3 ? "yellow" : "green"),
    how: "短期利率比長期還高叫「倒掛」，是景氣見頂的警報。收窄→倒掛→擴大→持平，對應擴張→趨緩→衰退→復甦。",
    course: "總經 3-7、4-1 圖 1",
  },
  {
    id: "DTWEXBGS",
    level: 2,
    name: "美元強弱（比去年）",
    transform: "yoyPct",
    unit: "%",
    digits: 1,
    lines: [{ value: 0, label: "0" }],
    judge: (v) => (v > 5 ? "red" : v > 0 ? "yellow" : "green"),
    how: "美元變強，錢流回美國，借美元的國家壓力變大。這裡用廣義美元指數的年增，不能直接套課程的 100 點門檻。",
    course: "總經 3-1、3-5",
  },
  {
    id: "BAMLH0A0HYM2",
    level: 2,
    name: "爛公司借錢加價",
    transform: "none",
    unit: "%",
    digits: 2,
    lines: [{ value: 5, label: "5%" }],
    judge: (v) => (v > 7 ? "red" : v > 5 ? "yellow" : "green"),
    how: "高收益債比公債多要的利息。突然變大＝市場怕公司倒，錢在逃（5%、7% 為本站參考線）。",
    course: "總經 3-7、4-1 圖 6",
  },
  {
    id: "DCOILWTICO",
    level: 2,
    name: "油價",
    transform: "none",
    unit: "美元",
    digits: 1,
    lines: [
      { value: 60, label: "60" },
      { value: 45, label: "45" },
    ],
    judge: (v) => (v > 60 || v < 45 ? "yellow" : "green"),
    how: "油價 45–60 美元最舒服：太高推升物價、逼央行升息；太低代表需求出問題（課程當時門檻）。",
    course: "總經 3-6、4-1 圖 9",
  },
  {
    id: "CPIAUCSL",
    level: 3,
    name: "物價（比去年）",
    transform: "yoyPct",
    unit: "%",
    digits: 1,
    lines: [{ value: 2.5, label: "平均 2.5%" }],
    judge: (v) => (v > 4 ? "red" : v > 2.5 ? "yellow" : "green"),
    how: "物價漲太快，央行就得踩煞車。這是羅盤判斷季節的第二個數字。",
    course: "產業 2-2、總經 1-3",
  },
  {
    id: "PCEPILFE",
    level: 3,
    name: "核心物價（央行最看的）",
    transform: "yoyPct",
    unit: "%",
    digits: 1,
    lines: [{ value: 2, label: "目標 2%" }],
    judge: (v) => (v > 3 ? "red" : v > 2.3 ? "yellow" : "green"),
    how: "扣掉油和食物的物價，央行目標 2%。離 2% 越遠，降息越難。",
    course: "總經 3-1",
  },
];

export const tilesOf = (level: number) => TILES.filter((t) => t.level === level);

// 日資料、週資料壓成每週最後一筆，月資料原樣，讓手機端畫圖不卡。
export function weekly(obs: Observation[]): Observation[] {
  const out: Observation[] = [];
  for (const o of obs) {
    const d = new Date(o.date);
    const monday = new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 86_400_000).toISOString().slice(0, 10);
    const last = out.at(-1);
    if (last && last.date >= monday) out[out.length - 1] = o;
    else out.push(o);
  }
  return out;
}

export function prepare(raw: Observation[], transform: Transform): Observation[] {
  const s = transform === "none" ? raw : applyTransform(raw, transform);
  return weekly(s).map((o) => ({ date: o.date, value: Math.round(o.value * 1000) / 1000 }));
}

// 和 n 天前比較：給數字卡的 ▲▼。
export function changeOver(s: Observation[], days: number): number | null {
  const last = s.at(-1);
  if (!last) return null;
  const t = new Date(new Date(last.date).getTime() - days * 86_400_000).toISOString().slice(0, 10);
  const prev = [...s].reverse().find((o) => o.date <= t);
  return prev ? last.value - prev.value : null;
}

// 景氣時鐘（M平方「蝌蚪圖」的白話版）：
// 上下＝成長多快（工廠生產年增，和近 10 年平均比），左右＝在加速還是減速（和 3 個月前比）。
export interface ClockPoint {
  date: string;
  level: number; // 年增（3 個月平均）
  accel: number; // 與 3 個月前相比
}

export function clockTrail(yoy: Observation[], months = 24): { avg: number; trail: ClockPoint[] } {
  const smooth = yoy.map((o, i) => {
    const w = yoy.slice(Math.max(0, i - 2), i + 1);
    return { date: o.date, value: w.reduce((s, x) => s + x.value, 0) / w.length };
  });
  const avg = smooth.length ? smooth.reduce((s, x) => s + x.value, 0) / smooth.length : 0;
  const trail: ClockPoint[] = [];
  for (let i = 3; i < smooth.length; i++)
    trail.push({ date: smooth[i].date, level: smooth[i].value, accel: smooth[i].value - smooth[i - 3].value });
  return { avg, trail: trail.slice(-months) };
}

export function clockPhase(p: ClockPoint, avg: number): PhaseKey {
  if (p.level >= avg) return p.accel >= 0 ? "expansion" : "slowdown";
  return p.accel >= 0 ? "recovery" : "recession";
}
