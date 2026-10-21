// 動能 10 檔：每月第一個交易日，買台股大型股裡「過去一年（扣掉最近一個月）漲最多」的 10 檔，平均分錢。
// 大盤（加權指數）跌破 200 日線時整個月空手。規則和回測見 /mnt/project-files/投資App/backtest/rules.py。
import type { UsBar } from "./us";

export const MOMENTUM_UNIVERSE: Record<string, string> = {
  "2330": "台積電",
  "2317": "鴻海",
  "2454": "聯發科",
  "2308": "台達電",
  "2382": "廣達",
  "2303": "聯電",
  "2881": "富邦金",
  "2882": "國泰金",
  "2891": "中信金",
  "2886": "兆豐金",
  "2412": "中華電",
  "3711": "日月光投控",
  "2884": "玉山金",
  "2357": "華碩",
  "2885": "元大金",
  "3231": "緯創",
  "2892": "第一金",
  "2345": "智邦",
  "2880": "華南金",
  "2327": "國巨",
  "3008": "大立光",
  "2379": "瑞昱",
  "2603": "長榮",
  "2609": "陽明",
  "2615": "萬海",
  "3037": "欣興",
  "3034": "聯詠",
  "2395": "研華",
  "2301": "光寶科",
  "4938": "和碩",
  "6669": "緯穎",
  "3017": "奇鋐",
  "2376": "技嘉",
  "2356": "英業達",
  "2324": "仁寶",
  "2353": "宏碁",
  "2377": "微星",
  "3661": "世芯-KY",
  "3443": "創意",
  "2449": "京元電子",
  "3045": "台灣大",
  "2207": "和泰車",
  "1301": "台塑",
  "1303": "南亞",
  "2002": "中鋼",
  "1216": "統一",
  "2912": "統一超",
  "5880": "合庫金",
  "2883": "凱基金",
  "2887": "台新金",
  "6505": "台塑化",
  "2408": "南亞科",
  "2344": "華邦電",
  "2337": "旺宏",
  "3481": "群創",
  "2409": "友達",
  "6116": "彩晶",
  "2618": "長榮航",
  "2610": "華航",
  "1513": "中興電",
  "1519": "華城",
  "1503": "士電",
  "1504": "東元",
  "3653": "健策",
  "6415": "矽力-KY",
  "2059": "川湖",
  "3533": "嘉澤",
  "2368": "金像電",
  "2383": "台光電",
  "8046": "南電",
  "3044": "健鼎",
  "2313": "華通",
  "3189": "景碩",
  "4958": "臻鼎-KY",
  "2360": "致茂",
  "2201": "裕隆",
  "1605": "華新",
};

export const MOMENTUM_N = 10;
/** 最近一個月（約 21 個交易日）不算，避開短線反轉 */
const SKIP = 21;

export interface MomentumPick {
  code: string;
  name: string;
  /** 過去一年扣掉最近一個月的漲跌幅 */
  ret: number;
  price: number;
}

/** 依動能排序，資料不到 230 天的不算 */
export function rankMomentum(bars: Record<string, UsBar[]>): MomentumPick[] {
  const out: MomentumPick[] = [];
  for (const [code, name] of Object.entries(MOMENTUM_UNIVERSE)) {
    const b = bars[code] ?? [];
    if (b.length < 230) continue;
    const from = b[0].close;
    const to = b[b.length - 1 - SKIP].close;
    if (!(from > 0)) continue;
    out.push({ code, name, ret: to / from - 1, price: b[b.length - 1].close });
  }
  return out.sort((a, b) => b.ret - a.ret);
}

/** 大盤在 200 日線上才進場 */
export function marketOk(index: UsBar[]) {
  if (index.length < 200) return null;
  const last = index.slice(-200);
  const ma = last.reduce((s, b) => s + b.close, 0) / 200;
  const close = index[index.length - 1].close;
  return { ok: close > ma, close, ma };
}

/** 預算平均分給每一檔，算零股股數 */
export function planShares(budget: number, picks: { price: number }[]) {
  const each = picks.length ? budget / picks.length : 0;
  return picks.map((p) => (p.price > 0 ? Math.floor(each / p.price) : 0));
}

/** 這個月要賣哪些、要買哪些 */
export function rebalance(held: string[], picks: string[]) {
  return {
    sell: held.filter((c) => !picks.includes(c)),
    keep: held.filter((c) => picks.includes(c)),
    buy: picks.filter((c) => !held.includes(c)),
  };
}
