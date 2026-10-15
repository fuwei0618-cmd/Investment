// App 主架構：以 CodeGym〈AI Agent 投資系統實戰課〉九章為主軸，
// 前面加上兩個基礎設定（財務目標、風險屬性），並以 M平方「動態投資思維羅盤」8 步當新手的投資主線。各課單元對應見 courses.ts。
export type ModuleStatus = "ready" | "planned";
export type ModuleGroup = "compass" | "foundation" | "agent";

export interface AppModule {
  slug: string;
  group: ModuleGroup;
  order: number; // 基礎 1–2；AI Agent 第 1–9 章
  title: string;
  question: string;
  summary: string;
  status: ModuleStatus;
}

export const MODULES: AppModule[] = [
  {
    slug: "compass",
    group: "compass",
    order: 0,
    title: "思維羅盤",
    question: "從哪裡開始看？",
    summary: "8 步由大到小：看懂世界景氣與資金 → 挑順風產業 → 找贏勢股、算目標價、決定買賣。全部白話。",
    status: "ready",
  },
  {
    slug: "goals",
    group: "foundation",
    order: 1,
    title: "財務目標",
    question: "我要達成什麼？",
    summary: "人生財務試算表、儲蓄率、退休所需資產與 4% 提領率。",
    status: "ready",
  },
  {
    slug: "risk",
    group: "foundation",
    order: 2,
    title: "風險屬性",
    question: "我能承擔多少風險？",
    summary: "20 題問卷（0–100 分、五型），對照人生階段建議高風險:防禦比例。",
    status: "ready",
  },
  {
    slug: "industry",
    group: "agent",
    order: 1,
    title: "產業脈絡",
    question: "這家公司在產業鏈的哪裡？",
    summary: "依景氣象限挑板塊，五大產業觀察指標、三大要領檢核。",
    status: "ready",
  },
  {
    slug: "quant",
    group: "agent",
    order: 2,
    title: "AI 分析師",
    question: "股價趨勢怎麼看？",
    summary: "均線、布林、KD、RSI、MACD、型態判讀、策略回測與分析師報告。",
    status: "planned",
  },
  {
    slug: "stock",
    group: "agent",
    order: 3,
    title: "看懂公司",
    question: "這家公司值得買嗎？",
    summary: "財報體質（F-Score、Z-Score、杜邦）、法說會、估值與安全邊際、多專家分析。",
    status: "planned",
  },
  {
    slug: "journal",
    group: "agent",
    order: 4,
    title: "覆盤成長",
    question: "我從每次交易學到什麼？",
    summary: "投資日誌、AI 檢討評分、發現規律並優化策略。",
    status: "planned",
  },
  {
    slug: "alerts",
    group: "agent",
    order: 5,
    title: "盯盤通知",
    question: "該知道的有沒有第一時間知道？",
    summary: "到價與訊號手機通知、盤前盤後 Email 報告、財報與事件預警。",
    status: "planned",
  },
  {
    slug: "chips",
    group: "agent",
    order: 6,
    title: "台股籌碼",
    question: "主力在做什麼？",
    summary: "融資融券、分點、三大法人、期貨選擇權未平倉與 Put/Call Ratio。",
    status: "ready", // 先做了三大法人和融資（/chips），分點與期貨未平倉之後補
  },
  {
    slug: "mindset",
    group: "agent",
    order: 7,
    title: "投資心理",
    question: "我的判斷有沒有被情緒帶走？",
    summary: "人類誤判心理學、VIX 與恐懼貪婪指數、新聞與社群情緒。",
    status: "planned",
  },
  {
    slug: "macro",
    group: "agent",
    order: 8,
    title: "全球脈動",
    question: "現在景氣在哪？",
    summary: "十張圖景氣反轉指標、景氣四象限與資產配置、財經行事曆。",
    status: "ready",
  },
  {
    slug: "portfolio",
    group: "agent",
    order: 9,
    title: "持股與 ETF 健檢",
    question: "我的部位健康嗎？",
    summary: "交易紀錄、損益、資產配置、再平衡與集中度、ETF 是否真分散。",
    status: "ready",
  },
];

export function findModule(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}

export function moduleLabel(m: AppModule) {
  if (m.group === "compass") return "主線";
  return m.group === "foundation" ? `基礎 ${m.order}` : `第 ${m.order} 章`;
}

// 網站只有三區：我的錢、看市場、課程。每個模組在新架構裡的位置。
export interface Place {
  area: "money" | "market" | "later";
  label: string;
  href: string;
}

const PLACES: Record<string, Place> = {
  goals: { area: "money", label: "我的錢・1 設目標", href: "/goals" },
  risk: { area: "money", label: "我的錢・2 測風險", href: "/risk" },
  portfolio: { area: "money", label: "我的錢・3 看持股", href: "/portfolio" },
  compass: { area: "market", label: "看市場", href: "/market" },
  macro: { area: "market", label: "看市場・第 1–3 關", href: "/market#level-1" },
  industry: { area: "market", label: "看市場・第 4–5 關", href: "/market#level-4" },
  stock: { area: "market", label: "看市場・第 6–8 關", href: "/market#level-6" },
  chips: { area: "market", label: "看市場・延伸：大戶在買什麼", href: "/chips" },
};

export function placeOf(slug: string): Place {
  const m = findModule(slug);
  return PLACES[slug] ?? { area: "later", label: `之後加入：${m?.title ?? slug}`, href: `/${slug}` };
}
