// 六種放法 × 鎮的四季：工具比較頁（字典）挑出最常見的六種，做成一張總表（地圖）。
// 表情是課程景氣時鐘的大方向，不是保證；數字用 1 萬元換算，出處寫在頁尾。
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Mood = [face: string, word: string, why: string];

export const SEASONS: { id: Season; name: string; desc: string }[] = [
  { id: "spring", name: "🌱 春天", desc: "成長快、物價低" },
  { id: "summer", name: "☀️ 夏天", desc: "成長快、物價高" },
  { id: "autumn", name: "🍂 秋天", desc: "成長慢、物價高" },
  { id: "winter", name: "❄️ 冬天", desc: "成長慢、物價低" },
];

export interface Way {
  /** 對應工具比較頁的卡片 id */
  toolId: string;
  icon: string;
  name: string;
  tool: string;
  cost: string;
  norm: string;
  worst: string;
  mood: Record<Season, Mood>;
}

export const SIX: Way[] = [
  {
    toolId: "tw-stock", icon: "🥐", name: "當一家店的股東", tool: "個股",
    cost: "約 60 元", norm: "看店", worst: "可能歸零",
    mood: {
      spring: ["😄", "最好", "客人回來，店賺錢，股價先漲。"],
      summer: ["🙂", "還好", "還在賺，但成本變高、利息變貴。"],
      autumn: ["😟", "變差", "生意變慢，股價先跌。"],
      winter: ["😱", "最痛", "客人變少，店可能撐不住。"],
    },
  },
  {
    toolId: "index-fund", icon: "🧺", name: "整條街每家都買一點", tool: "指數基金",
    cost: "約 80 元", norm: "+850 元", worst: "−4,300 元",
    mood: {
      spring: ["😄", "最好", "整條街一起賺。"],
      summer: ["🙂", "還好", "大部分店還在賺。"],
      autumn: ["😟", "變差", "大家一起變慢。"],
      winter: ["😟", "變差", "一起跌，但不會全倒。"],
    },
  },
  {
    toolId: "bond", icon: "📜", name: "借錢給店買烤箱", tool: "債券",
    cost: "約 40 元", norm: "+750 元", worst: "−1,300 元",
    mood: {
      spring: ["🙂", "還好", "利息低、穩穩收。"],
      summer: ["😟", "變差", "升息了，新借條利息更高，舊借條變不值錢。"],
      autumn: ["😐", "普通", "利息還在收，不好不壞。"],
      winter: ["😄", "最好", "降息了，舊借條變搶手；大家也躲進來。"],
    },
  },
  {
    toolId: "reits", icon: "🏢", name: "當店面的房東", tool: "不動產投資信託",
    cost: "約 50 元", norm: "+1,170 元", worst: "−3,800 元",
    mood: {
      spring: ["🙂", "還好", "店面開始搶手。"],
      summer: ["🙂", "還好", "租金跟著物價漲。"],
      autumn: ["😐", "普通", "租金收得到，漲不太動。"],
      winter: ["😟", "變差", "店關了，店面空著。"],
    },
  },
  {
    toolId: "gold", icon: "🥇", name: "換成金幣", tool: "黃金",
    cost: "約 150 元", norm: "不一定", worst: "−2,800 元",
    mood: {
      spring: ["😐", "普通", "大家敢冒險了，金幣沒人搶。"],
      summer: ["🙂", "還好", "東西在漲價，金幣也跟著漲。"],
      autumn: ["😄", "最好", "錢越來越不值錢，大家搶金幣。"],
      winter: ["🙂", "還好", "降息加上大家害怕，金幣有人要。"],
    },
  },
  {
    toolId: "deposit", icon: "🏦", name: "放銀行金庫", tool: "定存",
    cost: "0 元", norm: "+100 元", worst: "不會少",
    mood: {
      spring: ["😐", "普通", "利息很低。"],
      summer: ["🙂", "還好", "升息了，利息變多一點。"],
      autumn: ["😐", "普通", "有利息，但被物價吃掉。"],
      winter: ["😐", "普通", "本金安全，但利息又變少。"],
    },
  },
];

export const isSeason = (s: string): s is Season => SEASONS.some((x) => x.id === s);
