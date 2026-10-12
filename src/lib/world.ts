// 〈15單元看懂經濟運行〉2-3 各國 GDP 組成、2-4 全球人口：看「這個國家靠什麼賺錢」和「長線有沒有人」。
// 數字是約略值（各國統計與聯合國 2024 年人口推估的整數），只用來比較相對位置，不是精確統計。

export interface GdpMix {
  country: string;
  type: string; // 課程的分類
  consume: number; // 民間消費 %
  invest: number; // 投資 %
  gov: number; // 政府支出 %
  net: number; // 淨出口 %（出口減進口）
  watch: string; // 要盯的數字
}

export const GDP_MIX: GdpMix[] = [
  { country: "美國", type: "消費型", consume: 68, invest: 18, gov: 17, net: -3, watch: "就業、零售銷售、消費者信心" },
  { country: "日本", type: "消費型", consume: 55, invest: 26, gov: 20, net: -1, watch: "薪資、日圓、央行政策" },
  { country: "德國", type: "出口型", consume: 51, invest: 21, gov: 22, net: 6, watch: "工業生產、出口、中國需求" },
  { country: "台灣", type: "出口型", consume: 45, invest: 25, gov: 14, net: 16, watch: "電子出口年增、外銷訂單、美國科技需求" },
  { country: "中國", type: "投資型", consume: 39, invest: 42, gov: 16, net: 3, watch: "基建與房地產投資、M1／M2、PMI" },
];

export interface Population {
  country: string;
  youngMinusOld: number; // 15 歲以下占比 − 65 歲以上占比（百分點）
  growth: number; // 人口年增率 %
  medianAge: number;
}

export const POPULATION: Population[] = [
  { country: "印度", youngMinusOld: 18, growth: 0.9, medianAge: 29 },
  { country: "墨西哥", youngMinusOld: 15, growth: 0.8, medianAge: 30 },
  { country: "巴西", youngMinusOld: 9, growth: 0.5, medianAge: 34 },
  { country: "澳洲", youngMinusOld: 1, growth: 1.4, medianAge: 38 },
  { country: "美國", youngMinusOld: -1, growth: 0.5, medianAge: 39 },
  { country: "中國", youngMinusOld: 2, growth: -0.1, medianAge: 40 },
  { country: "台灣", youngMinusOld: -8, growth: -0.1, medianAge: 45 },
  { country: "南韓", youngMinusOld: -9, growth: -0.1, medianAge: 46 },
  { country: "德國", youngMinusOld: -9, growth: 0.1, medianAge: 45 },
  { country: "日本", youngMinusOld: -18, growth: -0.5, medianAge: 49 },
];

// 右上＝年輕又在長，左下＝變老又在縮。
export function popQuadrant(p: Population): "best" | "young" | "growing" | "worst" {
  if (p.youngMinusOld >= 0) return p.growth >= 0 ? "best" : "young";
  return p.growth >= 0 ? "growing" : "worst";
}

export const POP_TEXT = {
  best: "年輕又在長：勞動力和消費會一直變多，長線最有力",
  young: "還算年輕但人口開始縮",
  growing: "變老了，靠移民或還在微增撐著",
  worst: "變老又在縮：工作的人變少、消費變弱，經濟最辛苦",
} as const;
