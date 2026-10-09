// App 主選單：照課程「由上而下」的投資決策流程排列。
export type ModuleStatus = "ready" | "planned";

export interface AppModule {
  slug: string;
  step: number;
  title: string;
  question: string;
  summary: string;
  courses: string[];
  status: ModuleStatus;
}

export const MODULES: AppModule[] = [
  {
    slug: "goals",
    step: 1,
    title: "財務目標",
    question: "我要達成什麼？",
    summary: "人生財務試算表、儲蓄率、退休所需資產與 4% 提領率。",
    courses: ["王伯達 1-2～1-4、4-5、5-3"],
    status: "ready",
  },
  {
    slug: "risk",
    step: 2,
    title: "風險屬性",
    question: "我能承擔多少風險？",
    summary: "20 題問卷（0–100 分、五型），對照人生階段建議高風險:防禦比例。",
    courses: ["CodeGym 1-2", "王伯達 4-1、4-2"],
    status: "ready",
  },
  {
    slug: "macro",
    step: 3,
    title: "總經羅盤",
    question: "現在景氣在哪？",
    summary: "十張圖景氣反轉指標、景氣四象限與各階段資產配置。",
    courses: ["M平方 總經 2-1、2-2、3-7、4-1", "總經X產業X個股 2、5 章"],
    status: "ready",
  },
  {
    slug: "industry",
    step: 4,
    title: "產業雷達",
    question: "該投什麼產業？",
    summary: "五大產業觀察指標、三大要領檢核（成長、門檻、競爭）。",
    courses: ["總經X產業X個股 3 章"],
    status: "planned",
  },
  {
    slug: "stock",
    step: 5,
    title: "個股研究",
    question: "該買哪支股票？",
    summary: "四大面向選股、F-Score、Z-Score、杜邦、評價決策樹、DCF 與目標價。",
    courses: ["總經X產業X個股 4 章", "CodeGym 3、4 章"],
    status: "planned",
  },
  {
    slug: "quant",
    step: 6,
    title: "量化與技術",
    question: "什麼時候進出？",
    summary: "均線、布林、KD、RSI、MACD、超跌反彈評分與回測。",
    courses: ["CodeGym 5 章"],
    status: "planned",
  },
  {
    slug: "portfolio",
    step: 7,
    title: "持股與損益",
    question: "我的部位如何？",
    summary: "交易紀錄、損益、資產配置、再平衡與集中度提醒。",
    courses: ["王伯達 4-3、4-4", "CodeGym 6-2、9-1"],
    status: "ready",
  },
  {
    slug: "journal",
    step: 8,
    title: "日誌與情緒",
    question: "我的心態穩嗎？",
    summary: "交易理由紀錄、AI 檢討評分、VIX 與恐懼貪婪、新聞情緒。",
    courses: ["CodeGym 7、8 章"],
    status: "planned",
  },
  {
    slug: "agent",
    step: 9,
    title: "AI 助理",
    question: "讓 AI 幫我盯",
    summary: "多專家分析、盯盤通知、每日報告、ETF 健檢。",
    courses: ["AI Agent 投資系統實戰課（尚未上架）"],
    status: "planned",
  },
];

export function findModule(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}
