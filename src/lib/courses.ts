// 五門課的單元目錄（依 目錄.pdf），每個單元對應到 App 的哪一頁。
// module 為 null 代表方法論或工具介紹，不對應單一頁面。

export interface Unit {
  code: string;
  title: string;
  module: string | null;
}

export interface Chapter {
  title: string;
  units: Unit[];
}

export interface Course {
  key: string;
  name: string;
  teacher: string;
  status: "available" | "upcoming";
  role: string;
  chapters: Chapter[];
}

const u = (code: string, title: string, module: string | null): Unit => ({ code, title, module });

export const COURSES: Course[] = [
  {
    key: "ai-agent",
    name: "AI Agent 投資系統實戰課",
    teacher: "CodeGym Ryan",
    status: "upcoming",
    role: "主架構：App 的九章即本課九章",
    chapters: [
      {
        title: "一、看懂全局，再開始投資",
        units: [
          u("1-1", "課程介紹", null),
          u("1-2", "投資一家公司之前，先看懂它在產業鏈的位置", "industry"),
          u("1-3", "準備好你的工具", null),
          u("1-4", "不只是聊天：AI Agent 能做到更多", null),
        ],
      },
      {
        title: "二、打造你的 AI 分析師",
        units: [
          u("2-1", "用技能說明書教會 AI 專業知識", "quant"),
          u("2-2", "AI Agent 股價趨勢分析：指標與型態", "quant"),
          u("2-3", "一鍵產出專業分析師的報告", "quant"),
          u("練習 1", "讓 AI 研究員幫你分析一支股票", "quant"),
        ],
      },
      {
        title: "三、真正看懂一家公司",
        units: [
          u("3-1", "從 SEC 文件看見數字的真相", "stock"),
          u("3-2", "AI Agent 解讀法說會記錄", "stock"),
          u("3-3", "好公司不等於好投資：估值與安全邊際", "stock"),
          u("3-4", "打造 AI Agent 團隊：多位專家一起看一家公司", "stock"),
          u("練習 2", "用多專家團隊完成一份深度研究", "stock"),
        ],
      },
      {
        title: "四、與 AI 一同成長",
        units: [
          u("4-1", "你的 AI 會從每次分析中學習", "journal"),
          u("4-2", "覆盤優化：你來決策，AI 負責執行與改進", "journal"),
          u("練習 3", "AI 教學相長", "journal"),
        ],
      },
      {
        title: "五、讓 AI 替你盯盤",
        units: [
          u("5-1", "手機即時通知：到價與訊號", "alerts"),
          u("5-2", "Email 深度分析報告：盤前與盤後", "alerts"),
          u("練習 4", "打造你專屬的盯盤助理", "alerts"),
        ],
      },
      {
        title: "六、台股籌碼面分析",
        units: [
          u("6-1", "認識籌碼數據與 FinMind", "chips"),
          u("6-2", "個股籌碼：融資融券與分點", "chips"),
          u("6-3", "整體市場籌碼：三大法人與官股", "chips"),
          u("6-4", "期貨選擇權：未平倉與 Put/Call Ratio", "chips"),
          u("練習 5", "用 AI 完成一份台股完整投資評估", "chips"),
        ],
      },
      {
        title: "七、AI 時代的投資心理學",
        units: [
          u("7-1", "人類誤判心理學第 26 條", "mindset"),
          u("7-2", "AI 不是你的魔鏡", "mindset"),
        ],
      },
      {
        title: "八、看懂世界怎麼影響你的投資",
        units: [
          u("8-1", "AI Agent 梳理世界經濟脈絡", "macro"),
          u("8-2", "掌握財經行事曆", "macro"),
          u("8-3", "彙整今日全球新聞", "macro"),
          u("練習 6", "用 AI 產出一份全球經濟情勢報告", "macro"),
        ],
      },
      {
        title: "九、看懂你手上的 ETF",
        units: [
          u("9-1", "你的 ETF 是真分散還是假分散", "portfolio"),
          u("9-2", "你的 ETF 現在是順風還是逆風", "portfolio"),
        ],
      },
    ],
  },
  {
    key: "ai-invest",
    name: "高效 AI 投資術",
    teacher: "CodeGym Ryan",
    status: "available",
    role: "打底：AI Agent 課的前導，方法與指標的來源",
    chapters: [
      {
        title: "一、投資理財的基礎知識",
        units: [
          u("1-1", "課程介紹", null),
          u("1-2", "風險評估量表", "risk"),
          u("1-3", "美股、台股和其他投資工具", "portfolio"),
        ],
      },
      {
        title: "二、打造 AI 自動化的關鍵說明書",
        units: [
          u("2-1", "如何用 AI 自動撰寫和維護程式碼", null),
          u("2-2", "取得最新的市場資訊", null),
          u("2-3", "課程使用到的 AI 工具和軟體", null),
          u("2-4", "讓 AI 幫你撰寫股價分析程式", "quant"),
          u("2-5", "使用 n8n 打造自動化股價趨勢工作流", "alerts"),
        ],
      },
      {
        title: "三、AI 財報分析",
        units: [
          u("3-1", "如何閱讀公司財報篩選出好公司", "stock"),
          u("3-2", "價值投資選股策略", "stock"),
          u("3-3", "財報分析代理人", "stock"),
          u("3-4", "使用 n8n 打造自動化分析工作流", "alerts"),
        ],
      },
      {
        title: "四、AI 估值分析",
        units: [
          u("4-1", "評估公司價值的方法", "stock"),
          u("4-2", "AI 整合 DCF 現金流折現法", "stock"),
          u("4-3", "自動化估值分析", "stock"),
        ],
      },
      {
        title: "五、AI 量化分析",
        units: [
          u("5-1", "什麼是量化交易分析", "quant"),
          u("5-2", "動能交易策略分析", "quant"),
          u("5-3", "交易策略回測", "quant"),
          u("5-4", "打造自動化策略分析系統", "quant"),
        ],
      },
      {
        title: "六、ETF 與個人化投資組合",
        units: [
          u("6-1", "挑選 ETF 的關鍵指標", "portfolio"),
          u("6-2", "分散風險的投資組合", "portfolio"),
          u("6-3", "投資組合風險分析系統", "portfolio"),
        ],
      },
      {
        title: "七、投資心理學",
        units: [
          u("7-1", "理解人類的非理性行為", "mindset"),
          u("7-2", "克服情緒的弱點", "mindset"),
          u("7-3", "AI 分析市場新聞與社群情緒", "mindset"),
        ],
      },
      {
        title: "八、打造你的 AI 投資理財助理",
        units: [
          u("8-1", "AI 投資日誌分析系統（一）", "journal"),
          u("8-2", "AI 投資日誌分析系統（二）", "journal"),
        ],
      },
      {
        title: "九、募資解鎖課程",
        units: [
          u("9-1", "情境模擬：壓力測試投資組合", "portfolio"),
          u("9-2", "TradingView 策略轉化到 AI 量化系統", "quant"),
          u("9-3", "未來事件驅動策略：預警系統", "alerts"),
          u("9-4", "內部人交易分析系統", "stock"),
        ],
      },
    ],
  },
  {
    key: "mm-cycle",
    name: "總經 X 產業 X 個股",
    teacher: "財經 M 平方 Ryan、股市隱者",
    status: "available",
    role: "由上而下：總經擇時到產業到選股",
    chapters: [
      { title: "一、基礎篇", units: [u("1-1", "10 分鐘速讀循環到選股", "macro")] },
      {
        title: "二、總經篇",
        units: [
          u("2-1", "看懂關鍵數據，抓住景氣循環", "macro"),
          u("2-2", "領先掌握聯準會動向", "macro"),
        ],
      },
      {
        title: "三、產業篇",
        units: [
          u("3-1", "剖析五大產業，投資勝率最高的循環位階", "industry"),
          u("3-2", "三大要領判斷產業價值", "industry"),
        ],
      },
      {
        title: "四、個股篇",
        units: [
          u("4-1", "四個面向量化選股", "stock"),
          u("4-2", "算出目標價：評價方式", "stock"),
        ],
      },
      {
        title: "五、實戰篇",
        units: [
          u("5-1", "動態投資思維羅盤", "macro"),
          u("5-2", "羅盤演練：次貸、新興市場、疫情與現在", "macro"),
          u("5-3", "交易前必須知道的投資心法", "mindset"),
        ],
      },
    ],
  },
  {
    key: "mm-macro",
    name: "15 單元看懂經濟運行",
    teacher: "財經 M 平方 Rachel",
    status: "available",
    role: "總經基礎：景氣循環與十張圖",
    chapters: [
      {
        title: "一、課前須知",
        units: [
          u("1-1", "如何善用課程", null),
          u("1-2", "投資最重要的 5 大觀念", "mindset"),
          u("1-3", "MM 研究員的 5 大研究方法", "macro"),
        ],
      },
      {
        title: "二、總經與投資的基礎概念",
        units: [
          u("2-1", "景氣循環為什麼一再重演", "macro"),
          u("2-2", "股、匯、債、原物料的分配時機", "macro"),
          u("2-3", "拆解各地區 GDP 組成", "macro"),
          u("2-4", "從全球人口變化看經濟", "macro"),
        ],
      },
      {
        title: "三、實際財經新聞事件解析",
        units: [
          u("3-1", "聯準會升息：全球資金流向", "macro"),
          u("3-2", "中美貿易戰", "macro"),
          u("3-3", "疑歐派崛起", "macro"),
          u("3-4", "台股、台幣循環", "macro"),
          u("3-5", "新興市場危機", "macro"),
          u("3-6", "OPEC 與美國：誰掌控油價", "industry"),
          u("3-7", "殖利率曲線反轉", "macro"),
        ],
      },
      { title: "四、關鍵圖表", units: [u("4-1", "十張圖：全球財富重分配的時刻", "macro")] },
    ],
  },
  {
    key: "wang",
    name: "王伯達人生財務規劃學",
    teacher: "王伯達",
    status: "available",
    role: "財務目標與資產配置",
    chapters: [
      {
        title: "一、為什麼大多數人無法實現財務目標",
        units: [
          u("1-1", "前言", null),
          u("1-2", "為什麼絕大多數人無法實現財務目標", "goals"),
          u("1-3", "達成財務目標的關鍵因素", "goals"),
          u("1-4", "不同人生階段的財務規劃重點", "goals"),
        ],
      },
      {
        title: "二、資產配置的目的",
        units: [
          u("2-1", "投資與資產配置的差異", "portfolio"),
          u("2-2", "波動性與報酬率", "risk"),
          u("2-3", "資產配置的目的", "portfolio"),
          u("2-4", "資產配置為什麼有效", "portfolio"),
        ],
      },
      {
        title: "三、資產與投資工具",
        units: [
          u("3-1", "股票（上）", "portfolio"),
          u("3-2", "股票（下）", "portfolio"),
          u("3-3", "債券（上）", "portfolio"),
          u("3-4", "債券（下）", "portfolio"),
          u("3-5", "不動產投資", "portfolio"),
          u("3-6", "原物料", "portfolio"),
          u("3-7", "加密貨幣", "portfolio"),
          u("3-8", "資產章節總結", "portfolio"),
        ],
      },
      {
        title: "四、資產配置實作與投資組合管理",
        units: [
          u("4-1", "各種資產如何配置", "portfolio"),
          u("4-2", "建立投資組合", "portfolio"),
          u("4-3", "操作、檢討與改進（上）", "portfolio"),
          u("4-4", "操作、檢討與改進（下）", "portfolio"),
          u("4-5", "退休規劃（上）", "goals"),
          u("4-6", "退休規劃（下）", "goals"),
          u("4-7", "主動配置：殖利率曲線倒掛", "macro"),
          u("4-8", "主動配置：黃金", "macro"),
        ],
      },
      {
        title: "五、工具類資料與說明",
        units: [
          u("5-1", "為什麼是 ETF", "portfolio"),
          u("5-2", "如何投資 ETF：費用與稅率", "portfolio"),
          u("5-3", "尾聲", "goals"),
        ],
      },
    ],
  },
];

export function unitsForModule(slug: string) {
  return COURSES.map((c) => ({
    course: c,
    units: c.chapters.flatMap((ch) => ch.units).filter((x) => x.module === slug),
  })).filter((g) => g.units.length > 0);
}
