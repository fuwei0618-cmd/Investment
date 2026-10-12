// 把羅盤前 3 關的數字變成「今天的一句話答案」＋紅黃綠燈，給新手先看結論。
import { PHASES } from "./macro";
import { estimatePhase } from "./compass";
import type { PhaseKey } from "./industry";

export type Light = "green" | "yellow" | "red";

export interface Answer {
  light: Light;
  answer: string; // 一句白話結論
  reasons: string[]; // 依據的數字
}

// 第 1 關：世界景氣好嗎？（〈總經X產業X個股〉2-1：非農月增 15–20 萬為健康；美國就業轉壞才是大衰退）
export function economyAnswer(o: { payrollK: number | null; sahm: number | null; retailYoy: number | null }): Answer | null {
  if (o.payrollK === null || o.sahm === null) return null;
  const reasons = [
    `美國上月新增工作 ${o.payrollK.toFixed(1)} 萬個（15 萬以上算健康）`,
    `失業警報（薩姆規則）${o.sahm.toFixed(2)}（0.5 以上代表衰退）`,
  ];
  if (o.retailYoy !== null) reasons.push(`美國人花錢比去年多 ${o.retailYoy.toFixed(1)}%（低於 2% 算轉弱）`);
  if (o.sahm >= 0.5 || o.payrollK < 0)
    return { light: "red", answer: "美國人開始丟工作，景氣可能進入衰退。", reasons };
  if (o.payrollK < 15 || (o.retailYoy !== null && o.retailYoy < 2))
    return { light: "yellow", answer: "景氣還在走，但工作增加變慢了，要留意。", reasons };
  return { light: "green", answer: "美國人有工作、也還在花錢，景氣不錯。", reasons };
}

// 第 2 關：市場上的錢變多還是變少？（2-2：降息、購債＝放錢；升息、縮表＝收錢）
export function moneyAnswer(o: { rate: number | null; rate6mAgo: number | null; corePce: number | null }): Answer | null {
  if (o.rate === null || o.rate6mAgo === null) return null;
  const diff = o.rate - o.rate6mAgo;
  const reasons = [`美國央行利率 ${o.rate.toFixed(2)}%，半年來${diff > 0 ? "上升" : diff < 0 ? "下降" : "不變"} ${Math.abs(diff).toFixed(2)}`];
  if (o.corePce !== null) reasons.push(`核心通膨 ${o.corePce.toFixed(1)}%（央行目標 2%）`);
  const hot = o.corePce !== null && o.corePce > 2.5;
  if (diff <= -0.25)
    return {
      light: "green",
      answer: hot ? "央行在降息放錢，但物價還偏高，放錢速度可能不快。" : "央行在降息放錢，對股票有利。",
      reasons,
    };
  if (diff >= 0.25) return { light: "red", answer: "央行在升息收錢，股票比較難漲。", reasons };
  return {
    light: "yellow",
    answer: hot ? "央行按兵不動，因為物價還偏高。" : "央行按兵不動，錢不鬆也不緊。",
    reasons,
  };
}

// 第 3 關：現在是景氣的哪一季？
const PHASE_LIGHT: Record<PhaseKey, Light> = { recovery: "green", expansion: "green", slowdown: "yellow", recession: "red" };
const PHASE_TODO: Record<PhaseKey, string> = {
  recovery: "幾乎什麼都可以開始買，股票比例拉高。",
  expansion: "股票可以多一點，挑會一直成長的產業。",
  slowdown: "股票減一點、多留現金，偏向防守的產業。",
  recession: "現金最多、股票最少，等央行降息。",
};

export function seasonAnswer(o: { gdpYoy: number | null; cpiYoy: number | null }): (Answer & { phase: PhaseKey }) | null {
  if (o.gdpYoy === null || o.cpiYoy === null) return null;
  const phase = estimatePhase(o.gdpYoy, o.cpiYoy);
  const name = PHASES.find((p) => p.key === phase)!.name;
  return {
    phase,
    light: PHASE_LIGHT[phase],
    answer: `大概在「${name}」期：${PHASE_TODO[phase]}`,
    reasons: [
      `美國經濟成長 ${o.gdpYoy.toFixed(1)}%（平均約 2%）`,
      `物價上漲 ${o.cpiYoy.toFixed(1)}%（平均約 2.5%）`,
    ],
  };
}
