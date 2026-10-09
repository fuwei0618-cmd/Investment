// CodeGym〈高效AI投資術〉1-2 風險評估：20 題、四維度加權成 0–100 分、分五型。
// 課程只公布維度與權重，題目與分型切點為依課程描述自行設計（範例：總分 46 為穩健型）。

export type Dimension = "finance" | "experience" | "goal" | "psychology";

export const DIMENSIONS: { key: Dimension; label: string; weight: number }[] = [
  { key: "finance", label: "財務狀況", weight: 0.25 },
  { key: "experience", label: "投資經驗", weight: 0.2 },
  { key: "goal", label: "投資目標", weight: 0.2 },
  { key: "psychology", label: "風險心理承受度", weight: 0.35 },
];

export interface Question {
  id: string;
  dimension: Dimension;
  text: string;
  options: string[]; // 依序 0–3 分
}

export const QUESTIONS: Question[] = [
  // 財務狀況：收入穩定性、緊急預備金、負債、財務責任
  { id: "f1", dimension: "finance", text: "你的收入穩定程度？", options: ["不穩定或目前沒有收入", "收入有波動（接案、業務獎金為主）", "穩定，但產業景氣影響大", "非常穩定（公職、穩定產業、多元收入）"] },
  { id: "f2", dimension: "finance", text: "緊急預備金可以支應幾個月的必要生活費？", options: ["不到 1 個月", "1–3 個月", "3–6 個月", "6 個月以上"] },
  { id: "f3", dimension: "finance", text: "每月還款（房貸以外）占收入的比例？", options: ["超過 40%", "20%–40%", "1%–20%", "沒有負債"] },
  { id: "f4", dimension: "finance", text: "需要你負擔生活費的家人有幾位？", options: ["3 位以上", "2 位", "1 位", "沒有"] },
  { id: "f5", dimension: "finance", text: "每月可存下的錢占收入多少？", options: ["幾乎存不了", "10% 以下", "10%–25%", "25% 以上"] },
  // 投資經驗：年資、工具熟悉度、行為模式
  { id: "e1", dimension: "experience", text: "你投資股票或基金幾年了？", options: ["還沒開始", "不到 2 年", "2–5 年", "5 年以上"] },
  { id: "e2", dimension: "experience", text: "你實際用過哪些投資工具？", options: ["只有存款或儲蓄險", "基金或 ETF", "ETF 加上個股", "還有期貨、選擇權或槓桿商品"] },
  { id: "e3", dimension: "experience", text: "你經歷過幾次大跌（例如 2020 疫情、2022 升息）時仍持有部位？", options: ["沒經歷過", "經歷過但當時賣光", "經歷過一次並續抱", "經歷過多次並續抱或加碼"] },
  { id: "e4", dimension: "experience", text: "你能看懂財報與估值（例如 EPS、本益比、現金流）嗎？", options: ["完全不懂", "知道名詞但不太會用", "會用來篩選標的", "能自行估算合理價"] },
  { id: "e5", dimension: "experience", text: "你通常怎麼做投資決定？", options: ["聽親友或媒體推薦", "看網路文章後決定", "有自己的簡單規則", "有完整的研究與紀錄流程"] },
  // 投資目標：期限、目的、流動性
  { id: "g1", dimension: "goal", text: "這筆錢預計多久後會用到？", options: ["1 年內", "1–3 年", "3–10 年", "10 年以上"] },
  { id: "g2", dimension: "goal", text: "你主要的投資目的？", options: ["保本", "穩定配息補貼生活", "長期累積退休金", "追求資產大幅成長"] },
  { id: "g3", dimension: "goal", text: "未來 3 年內有沒有大額支出（買房、結婚、學費）？", options: ["確定有，且金額很大", "可能有", "有但已另外準備好", "沒有"] },
  { id: "g4", dimension: "goal", text: "你期待的長期年化報酬？", options: ["比定存高一點就好（1–3%）", "4–6%", "7–10%", "10% 以上"] },
  { id: "g5", dimension: "goal", text: "投資金額占你總資產的比例？", options: ["超過 80%", "50%–80%", "20%–50%", "不到 20%"] },
  // 風險心理承受度：面對波動、可接受損失、決策風格
  { id: "p1", dimension: "psychology", text: "投資組合一個月內跌了 20%，你會？", options: ["全部賣掉", "賣掉一部分", "不動作", "加碼買進"] },
  { id: "p2", dimension: "psychology", text: "一年內最多能接受多少虧損？", options: ["不能虧", "10% 以內", "10%–25%", "25% 以上"] },
  { id: "p3", dimension: "psychology", text: "你會選哪一個組合？", options: ["保證 +3%", "最好 +10%、最差 −5%", "最好 +25%、最差 −15%", "最好 +50%、最差 −35%"] },
  { id: "p4", dimension: "psychology", text: "市場大跌時你的睡眠和情緒？", options: ["焦慮到影響生活", "會一直看盤", "有點在意但不影響生活", "幾乎不受影響"] },
  { id: "p5", dimension: "psychology", text: "看到熱門股大漲而你沒買，你通常會？", options: ["很懊惱，常常追高", "有時忍不住追", "照原本計畫，偶爾心動", "完全照計畫執行"] },
];

export const RISK_TYPES = [
  { key: "conservative", name: "保守型", min: 0, riskRatio: 0.3, desc: "以本金安全為主，適合定存、投資級債等低風險工具。" },
  { key: "moderate", name: "穩健型", min: 30, riskRatio: 0.5, desc: "能接受適度風險換取較好收益。" },
  { key: "balanced", name: "平衡型", min: 50, riskRatio: 0.65, desc: "追求風險與報酬的平衡，可考慮指數型基金或股債混合。" },
  { key: "growth", name: "成長型", min: 65, riskRatio: 0.8, desc: "願意承擔較高風險追求資本增值。" },
  { key: "aggressive", name: "積極型", min: 80, riskRatio: 0.9, desc: "追求最大報酬、能承受高波動，可考慮個股或另類投資。" },
] as const;

export type Answers = Record<string, number>;

export interface RiskResult {
  total: number;
  dims: Record<Dimension, number>;
  type: (typeof RISK_TYPES)[number];
  date: string;
}

export function scoreAnswers(answers: Answers): Omit<RiskResult, "date"> {
  const dims = {} as Record<Dimension, number>;
  for (const d of DIMENSIONS) {
    const qs = QUESTIONS.filter((q) => q.dimension === d.key);
    const sum = qs.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
    dims[d.key] = Math.round((sum / (qs.length * 3)) * 100);
  }
  const total = Math.round(DIMENSIONS.reduce((s, d) => s + dims[d.key] * d.weight, 0));
  return { total, dims, type: typeOf(total) };
}

export function typeOf(total: number) {
  return [...RISK_TYPES].reverse().find((t) => total >= t.min) ?? RISK_TYPES[0];
}
