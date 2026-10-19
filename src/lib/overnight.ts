import { changeOver, type UsBar } from "./us";
import type { Check } from "./pick";

// 昨晚美股發生什麼：只看數字整理出原因（哪一類跌最多、連跌幾天、利率、油價、黃金），不是抄新聞

const pct = (x: number, d = 1) =>
  Math.abs(x) < 0.0005 ? "0.0%" : `${x > 0 ? "+" : ""}${(x * 100).toFixed(d)}%`;
const abs = (x: number) => `${Math.abs(x * 100).toFixed(1)}%`;

/** 連續收黑幾天（今天跟前一天比） */
export function downStreak(bars: UsBar[]) {
  let n = 0;
  for (let i = bars.length - 1; i > 0 && bars[i].close < bars[i - 1].close; i--)
    n++;
  return n;
}

/** 現在離一年內最高收盤跌了多少（負數） */
export function fromHigh(bars: UsBar[]) {
  const last = bars.at(-1);
  if (!last) return null;
  const high = Math.max(...bars.map((b) => b.close));
  return last.close / high - 1;
}

export interface Move {
  name: string;
  close: number;
  d: number | null;
}

export const move = (name: string, bars: UsBar[]): Move | null => {
  const last = bars.at(-1);
  return last ? { name, close: last.close, d: changeOver(bars, 1) } : null;
};

/** 十年美債：雅虎 ^TNX 有時候是 45.1 代表 4.51%，統一成百分比 */
export const tenYear = (bars: UsBar[]) => {
  const v = bars.at(-1)?.close;
  return v == null ? null : v > 20 ? v / 10 : v;
};

export interface Overnight {
  /** 大跌：那斯達克或費半跌超過 2% */
  big: boolean;
  /** 一句話標題 */
  head: string;
  /** 為什麼：幾句白話 */
  why: string[];
  /** 費半是不是跌最兇（台股一半以上是半導體） */
  chipsWorst: boolean;
}

export function overnight(o: {
  spx: Move | null;
  ndx: Move | null;
  sox: Move | null;
  soxStreak: number;
  sectors: { name: string; d: number | null }[];
  tnx: number | null;
  oil: Move | null;
  gold: Move | null;
}): Overnight | null {
  const { spx, ndx, sox } = o;
  if (spx?.d == null) return null;
  const big = (ndx?.d ?? 0) <= -0.02 || (sox?.d ?? 0) <= -0.02;
  const down = spx.d < 0;
  const head =
    spx.d <= -0.01 || big
      ? "美股大跌"
      : spx.d >= 0.01
        ? "美股大漲"
        : down
          ? "美股小跌"
          : "美股小漲";
  const why: string[] = [];
  const idx = [spx, ndx, sox].filter((m): m is Move => m?.d != null);
  why.push(`${idx.map((m) => `${m.name} ${pct(m.d!)}`).join("、")}。`);
  const chipsWorst =
    !!sox?.d && sox.d < 0 && idx.every((m) => m === sox || m.d! > sox.d!);
  if (chipsWorst)
    why.push(
      `跌最多的是半導體${o.soxStreak >= 3 ? `，已經連跌 ${o.soxStreak} 天` : ""}，錢從科技股跑出來。`,
    );
  else {
    const s = o.sectors
      .filter((x) => x.d != null)
      .sort((a, b) => (down ? a.d! - b.d! : b.d! - a.d!))[0];
    if (s)
      why.push(`${down ? "跌" : "漲"}最多的是${s.name}類（${abs(s.d!)}）。`);
  }
  if (o.tnx != null && o.tnx >= 4.5)
    why.push(
      `十年美債利率 ${o.tnx.toFixed(1)}%，借錢的利息很高，最靠未來賺錢的科技股最怕。`,
    );
  if (o.oil?.d != null && o.oil.d >= 0.03)
    why.push(
      `油價漲 ${abs(o.oil.d)} 到 ${o.oil.close.toFixed(1)}，東西會變更貴，央行就不敢降息，對股票是壓力。`,
    );
  if (o.oil?.d != null && o.oil.d <= -0.03)
    why.push(`油價跌 ${abs(o.oil.d)}，物價壓力小一點。`);
  if (down && o.gold?.d != null && o.gold.d >= 0.005)
    why.push(`黃金漲 ${abs(o.gold.d)}，有錢跑去避險。`);
  return { big, head, why, chipsWorst };
}

/** 低接卡的兩個條件：大家很怕（恐慌指數 30 以上）、跌夠深（比一年內最高跌超過 10%） */
export function dipCheck(vix: number | null, drop: number | null) {
  const conds = [
    {
      ok: vix != null && vix >= 30,
      text: "大家很怕：恐慌指數衝過 30",
      now: vix == null ? "抓不到" : `現在 ${vix.toFixed(1)}`,
    },
    {
      ok: drop != null && drop <= -0.1,
      text: "跌夠深：大盤比一年內最高點跌超過 10%",
      now: drop == null ? "抓不到" : `現在 ${pct(drop)}`,
    },
  ];
  return { conds, pass: conds.every((c) => c.ok) };
}

/** 美股放空：買一倍反向標普 500（SH）。規則跟台股放空一樣：跌 5% 停損、漲 8% 先賣一半、最多放兩週 */
export const US_INVERSE = {
  code: "SH",
  name: "反向標普 500",
  stopPct: 0.05,
  targetPct: 0.08,
};

export function usShortCheck(
  close: number,
  spx: { close: number; ma: number },
): Check {
  return {
    close,
    high20: close,
    volRatio: 1,
    streak: 0,
    breakout: false,
    pass: true,
    score: 3,
    conds: [
      {
        ok: true,
        text: `標普 500 收 ${Math.round(spx.close)}，在月線 ${Math.round(spx.ma)} 下面`,
        why: "大盤往下走時，買反向基金，大盤跌它就漲。",
        need: "",
      },
    ],
    stopAt: close * (1 - US_INVERSE.stopPct),
    targetPct: US_INVERSE.targetPct,
    stopText: "用「買價少 5%」。",
    exitText: "漲 8% 先賣一半；標普站回月線上，或放滿兩週，剩下的全部賣掉。",
    entryNote:
      "這是一倍的反向基金，標普跌 1% 它大約漲 1%。不要買三倍的，放幾天就會被磨掉。國泰複委託可以買：先在券商軟體「我的 → 線上簽署」簽好「槓桿反向型 ETF」風險預告書，就能直接下單。",
    mustSell: "標普站回月線上，或放滿兩週",
  };
}

/** 給 AI 對照新聞用的數字（只放事實，不放解釋） */
export function factsText(o: {
  moves: (Move | null)[];
  soxStreak: number;
  sectors: { name: string; d: number | null }[];
  tnx: number | null;
}) {
  const l = o.moves
    .filter((m): m is Move => m?.d != null)
    .map((m) => `${m.name} ${m.close.toFixed(1)}（${pct(m.d!)}）`);
  const s = o.sectors
    .filter((x) => x.d != null)
    .sort((a, b) => a.d! - b.d!)
    .map((x) => `${x.name} ${pct(x.d!)}`);
  return [
    l.join("、"),
    o.soxStreak >= 2 ? `費城半導體連跌 ${o.soxStreak} 天` : "",
    s.length ? `各類股（跌最多排前面）：${s.join("、")}` : "",
    o.tnx != null ? `十年美債利率 ${o.tnx.toFixed(2)}%` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
