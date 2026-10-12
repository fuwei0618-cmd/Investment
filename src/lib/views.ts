// 看產業的幾種角度：課程的 GICS 標準、食衣住行育樂、一座城市。
// sector 一律用 NEED_SECTORS 的名稱；chain 對應 chains.ts 的 key。公司只是例子，不是推薦。

// 〈總經X產業X個股〉3-2：MSCI 與標普 1999 年編的「全球行業分類標準」GICS。
// 2023 年改制後是 11 個板塊、25 個行業組（再往下 74 個行業、163 個子行業）。
export interface GicsSector {
  sector: string;
  en: string;
  groups: string[]; // 第二層行業組
  plain: string;
  examples: string;
  etf: string;
  kind: "循環" | "防禦" | "成長";
}

export const GICS: GicsSector[] = [
  { sector: "資訊科技", en: "Information Technology", groups: ["軟體與服務", "科技硬體與設備", "半導體及設備"], plain: "做晶片、電腦、軟體的公司", examples: "台積電、蘋果、輝達、微軟", etf: "XLK", kind: "成長" },
  { sector: "醫療保健", en: "Health Care", groups: ["醫療設備與服務", "製藥、生技與生命科學"], plain: "做藥、醫療器材、開醫院的公司", examples: "禮來、嬌生、聯合健康", etf: "XLV", kind: "防禦" },
  { sector: "金融", en: "Financials", groups: ["銀行", "金融服務", "保險"], plain: "銀行、保險、付款和投資公司", examples: "摩根大通、Visa、國泰金", etf: "XLF", kind: "循環" },
  { sector: "非必需消費", en: "Consumer Discretionary", groups: ["汽車及零組件", "耐久消費品與服飾", "消費者服務", "非必需消費品經銷與零售"], plain: "想要但不一定要買的東西：車、衣服、旅遊、網購", examples: "亞馬遜、特斯拉、Nike、麥當勞", etf: "XLY", kind: "循環" },
  { sector: "通訊服務", en: "Communication Services", groups: ["電信服務", "媒體與娛樂"], plain: "電信網路、社群平台、影音娛樂", examples: "Google、Meta、Netflix、中華電信", etf: "XLC", kind: "成長" },
  { sector: "工業", en: "Industrials", groups: ["資本財", "商業及專業服務", "運輸"], plain: "造機器、蓋工程、運貨的公司", examples: "奇異、卡特彼勒、長榮海運", etf: "XLI", kind: "循環" },
  { sector: "必需消費", en: "Consumer Staples", groups: ["必需消費品經銷與零售", "食品、飲料與菸草", "家庭與個人用品"], plain: "每天一定要買的：吃的、喝的、日用品", examples: "可口可樂、寶僑、Costco、統一", etf: "XLP", kind: "防禦" },
  { sector: "能源", en: "Energy", groups: ["能源"], plain: "挖油氣、煉油、運油的公司", examples: "埃克森美孚、雪佛龍", etf: "XLE", kind: "循環" },
  { sector: "公用事業", en: "Utilities", groups: ["公用事業"], plain: "供電、供水、供瓦斯", examples: "新紀元能源、杜克能源", etf: "XLU", kind: "防禦" },
  { sector: "房地產", en: "Real Estate", groups: ["不動產投資信託（REITs）", "不動產管理與開發"], plain: "蓋房子、出租辦公室和倉庫", examples: "安博（物流倉庫）、美國電塔", etf: "XLRE", kind: "循環" },
  { sector: "原材料", en: "Materials", groups: ["原材料"], plain: "鋼鐵、化學品、礦產、紙和包材", examples: "林德氣體、中鋼、台塑", etf: "XLB", kind: "循環" },
];

export const GICS_NOTES = [
  "房地產在 2016 年才從金融獨立出來；通訊服務是 2018 年從電信改名，並加入媒體、娛樂和網路公司。",
  "所以 Google、Meta 屬於通訊服務，不是資訊科技；亞馬遜、特斯拉屬於非必需消費。",
  "多數產業 ETF 照這 11 個板塊分，例如 SPDR 的 XL 系列。",
];

// 食衣住行育樂，再加上看病和工作賺錢：生活裡每一種花費背後的產業。
export interface LifePart {
  key: string;
  icon: string;
  name: string;
  you: string;
  sectors: { sector: string; what: string; chain?: string }[];
}

export const LIFE: LifePart[] = [
  { key: "food", icon: "🍚", name: "食", you: "三餐、飲料、零食、超市採買", sectors: [
    { sector: "必需消費", what: "食品飲料品牌、超市量販", chain: "staples" },
    { sector: "原材料", what: "肥料、包裝材料" },
  ] },
  { key: "clothes", icon: "👕", name: "衣", you: "衣服、鞋子、包包、保養品", sectors: [
    { sector: "非必需消費", what: "服飾品牌、運動鞋、精品" },
    { sector: "必需消費", what: "洗髮精、牙膏這類個人用品", chain: "staples" },
  ] },
  { key: "home", icon: "🏠", name: "住", you: "房租房貸、水電瓦斯、家電", sectors: [
    { sector: "房地產", what: "蓋房子、出租房子和辦公室" },
    { sector: "公用事業", what: "電力、自來水、瓦斯", chain: "energy" },
    { sector: "金融", what: "房貸、火險", chain: "finance" },
  ] },
  { key: "move", icon: "🚗", name: "行", you: "開車、搭車、加油充電、出國", sectors: [
    { sector: "非必需消費", what: "汽車、電動車", chain: "ev" },
    { sector: "能源", what: "汽油、天然氣", chain: "energy" },
    { sector: "工業", what: "航空、鐵路、海運、物流", chain: "industrial" },
  ] },
  { key: "learn", icon: "📚", name: "育", you: "上網學東西、用手機電腦、上課", sectors: [
    { sector: "資訊科技", what: "手機電腦、晶片、雲端軟體", chain: "semi-ai" },
    { sector: "通訊服務", what: "網路、搜尋、線上課程平台", chain: "telecom-media" },
  ] },
  { key: "fun", icon: "🎮", name: "樂", you: "追劇、打遊戲、吃大餐、旅行", sectors: [
    { sector: "通訊服務", what: "影音串流、遊戲、社群", chain: "telecom-media" },
    { sector: "非必需消費", what: "餐廳、飯店、旅行社、網購" },
  ] },
  { key: "health", icon: "🏥", name: "醫", you: "看病、拿藥、健檢、保險", sectors: [
    { sector: "醫療保健", what: "藥廠、醫療器材、醫院", chain: "healthcare" },
    { sector: "金融", what: "醫療險、壽險", chain: "finance" },
  ] },
  { key: "work", icon: "💼", name: "工作", you: "公司用的電腦軟體、工廠機器、薪水和存款", sectors: [
    { sector: "資訊科技", what: "公司用的雲端和軟體", chain: "cloud-software" },
    { sector: "工業", what: "工廠機器、自動化、工程", chain: "industrial" },
    { sector: "金融", what: "薪轉、存款、投資、借貸", chain: "finance" },
    { sector: "原材料", what: "鋼鐵、化學品等原料" },
  ] },
];

// 一座城市：每棟建築是一個產業，連線是貨、電、錢的流向。座標在 360×300 的地圖上。
export interface Place {
  id: string;
  icon: string;
  name: string;
  x: number;
  y: number;
  sector: string;
  chain?: string;
  does: string;
  feeds: string[]; // 它供應給誰（下游）
  companies: string;
}

export const CITY: Place[] = [
  { id: "mine", icon: "⛏️", name: "礦場與煉鋼廠", x: 45, y: 40, sector: "原材料", does: "把礦石、石油變成鋼鐵、塑膠、化學品，是所有東西的起點。", feeds: ["factory", "fab"], companies: "中鋼、台塑、林德氣體" },
  { id: "power", icon: "⚡", name: "發電廠與太陽能", x: 130, y: 35, sector: "公用事業", chain: "energy", does: "把天然氣、煤、陽光、風變成電，整座城市都靠它。AI 資料中心越多，電越不夠用。", feeds: ["fab", "datacenter", "factory", "homes", "hospital"], companies: "台電、新紀元能源、第一太陽能" },
  { id: "datacenter", icon: "🗄️", name: "資料中心", x: 225, y: 40, sector: "資訊科技", chain: "cloud-software", does: "一整棟的電腦，出租給大家跑網站、App 和 AI。", feeds: ["tower", "bank"], companies: "微軟、亞馬遜 AWS、Google 雲" },
  { id: "tower", icon: "📡", name: "電信基地台", x: 315, y: 45, sector: "通訊服務", chain: "telecom-media", does: "把網路送到每支手機。平台公司在這條「路」上賺廣告和訂閱。", feeds: ["homes", "mall"], companies: "中華電信、台灣大、Google、Meta" },
  { id: "fab", icon: "🔬", name: "晶片工廠", x: 85, y: 120, sector: "資訊科技", chain: "semi-ai", does: "用很貴的機器把矽做成晶片，再送去組成手機、電腦和 AI 伺服器。", feeds: ["datacenter", "factory"], companies: "台積電、日月光、艾司摩爾" },
  { id: "bank", icon: "🏦", name: "銀行與保險", x: 185, y: 120, sector: "金融", chain: "finance", does: "收大家的存款和保費，再借給工廠、房子和公司，賺中間的利差。", feeds: ["factory", "homes", "mall"], companies: "國泰金、富邦金、摩根大通、Visa" },
  { id: "hospital", icon: "🏥", name: "醫院與藥局", x: 290, y: 125, sector: "醫療保健", chain: "healthcare", does: "看病、開藥、用醫療器材。人越老，來的人越多。", feeds: ["homes"], companies: "禮來、嬌生、美敦力" },
  { id: "factory", icon: "🏭", name: "工廠與機器", x: 60, y: 205, sector: "工業", chain: "industrial", does: "用機器把原料和晶片組成車子、家電、各種商品。", feeds: ["port", "mall", "carshop"], companies: "鴻海、西門子、上銀、卡特彼勒" },
  { id: "carshop", icon: "🚗", name: "車廠與加油站", x: 155, y: 205, sector: "非必需消費", chain: "ev", does: "賣車、修車、加油充電。景氣好時大家才換新車。", feeds: ["homes"], companies: "特斯拉、豐田、台塑石化" },
  { id: "mall", icon: "🛒", name: "超市與商場", x: 245, y: 205, sector: "必需消費", chain: "staples", does: "把食品、日用品、衣服賣給住在城裡的人。", feeds: ["homes"], companies: "統一超、全聯、Costco、可口可樂" },
  { id: "port", icon: "🚢", name: "港口與物流", x: 45, y: 255, sector: "工業", chain: "industrial", does: "把城裡做的東西運到國外，也把原料和商品運進來。", feeds: ["mall", "factory"], companies: "長榮海運、陽明、UPS" },
  { id: "homes", icon: "🏘️", name: "住宅區", x: 300, y: 255, sector: "房地產", does: "你住的地方。你付的房租、電費、網路費、買菜錢，就是上面每一棟建築的收入。", feeds: ["bank", "mall"], companies: "建商、REITs" },
];

// 上中下游：每條產業鏈都能切成這三段，同一段的公司，賺錢方式和景氣反應很像。
export const STAGES = [
  {
    stage: "上游" as const,
    icon: "⛏️",
    plain: "賣原料、機器、零件給別人做東西",
    like: "像賣麵粉和烤箱給麵包店",
    money: "訂單一次很大，景氣一好最先接到單，景氣一差也最先被砍單，股價起伏最大。",
    watch: "下游客戶的訂單和庫存：客戶東西賣得好，才會跟上游多買。",
  },
  {
    stage: "中游" as const,
    icon: "🏭",
    plain: "把原料做成產品，或替品牌代工",
    like: "像麵包店本身",
    money: "靠做得多、做得好、做得便宜賺錢。技術領先的少數幾家能賺很多，其他家常在拚價格。",
    watch: "產能有沒有滿、毛利率（每賣 100 元扣掉成本剩多少）有沒有往上。",
  },
  {
    stage: "下游" as const,
    icon: "🛍️",
    plain: "把東西賣到你手上，或提供服務",
    like: "像便利商店把麵包賣給你",
    money: "離你最近，靠品牌和通路讓你一直回來買。景氣變化傳到這裡最慢，也比較穩。",
    watch: "大家還買不買：營收、來客數、訂閱人數。",
  },
];

// 台灣 vs 美國：兩邊股市裡，各產業佔多少。
// 美國：S&P 500，chartrow.com 2026-10-09 估計值。台灣：本站依台積電約佔大盤四成多、電子股為主粗估，只看大概。
export const MARKET_MIX: { sector: string; us: number; tw: number }[] = [
  { sector: "資訊科技", us: 39.7, tw: 75 },
  { sector: "金融", us: 11.5, tw: 10 },
  { sector: "通訊服務", us: 9.6, tw: 3 },
  { sector: "醫療保健", us: 9.1, tw: 1 },
  { sector: "非必需消費", us: 8.9, tw: 2 },
  { sector: "工業", us: 7.9, tw: 3 },
  { sector: "必需消費", us: 4.4, tw: 1.5 },
  { sector: "能源", us: 3.6, tw: 0.5 },
  { sector: "公用事業", us: 2.0, tw: 0.5 },
  { sector: "房地產", us: 1.6, tw: 0.5 },
  { sector: "原材料", us: 1.5, tw: 3 },
];

export const TW_US = {
  tw: {
    flag: "🇹🇼",
    name: "台灣",
    strong: "幫全世界「做」東西：晶圓代工、封測、伺服器組裝、零組件。大多在產業鏈的中游。",
    feel: "台積電一家就約佔台股四成多，大盤漲跌幾乎跟著電子股和 AI 訂單走。",
    risk: "太集中：電子景氣一轉弱，整個台股都會受影響；客戶多在國外，也要看匯率和國際關係。",
  },
  us: {
    flag: "🇺🇸",
    name: "美國",
    strong: "「設計」和「賣」東西：晶片設計、雲端、軟體、平台、品牌、藥廠。大多在上游的設計和下游的品牌。",
    feel: "科技約佔四成，但醫療、金融、消費、工業也都有一定份量，比較分散。",
    risk: "大型科技股很貴、佔比越來越高；美國利率和美元一動，全世界股市都會跟著動。",
  },
};

// 同一條鏈上，美國公司常是台灣公司的客戶。
export const TW_US_PAIRS: { us: string; tw: string; how: string; chain: string }[] = [
  { us: "輝達（設計 AI 晶片）", tw: "台積電（代工製造）", how: "輝達畫設計圖，台積電照圖把晶片做出來。", chain: "semi-ai" },
  { us: "微軟、亞馬遜（雲端）", tw: "廣達、緯穎（組伺服器）", how: "雲端公司買伺服器蓋資料中心，台灣廠負責組裝。", chain: "cloud-software" },
  { us: "蘋果（手機品牌）", tw: "鴻海、大立光（組裝、鏡頭）", how: "蘋果設計和賣 iPhone，台灣廠做零件和組裝。", chain: "semi-ai" },
  { us: "特斯拉（電動車）", tw: "台達電、和大（電源、齒輪）", how: "車廠買零組件，台灣廠是供應商。", chain: "ev" },
];

// 大趨勢：會影響很多年、跨好幾個產業的長期方向。
export interface Trend {
  key: string;
  icon: string;
  name: string;
  what: string;
  sectors: string[];
  chains: string[];
  examples: string;
  watch: string;
  careful: string;
}

export const TRENDS: Trend[] = [
  {
    key: "ai", icon: "🤖", name: "AI 與算力",
    what: "大家都在用 AI，需要大量晶片和資料中心來算，從晶片、伺服器、電力到軟體都被帶動。",
    sectors: ["資訊科技", "通訊服務", "公用事業"], chains: ["semi-ai", "cloud-software"],
    examples: "輝達、台積電、廣達、微軟",
    watch: "大型雲端公司每季說要花多少錢蓋資料中心（資本支出）。",
    careful: "期待已經很高、股價很貴；如果 AI 賺不到錢，雲端公司少花錢，整條鏈都會受影響。",
  },
  {
    key: "aging", icon: "👵", name: "高齡化",
    what: "全世界越來越多老人，看病、吃藥、照顧和保險的需求每年都在增加，景氣差也不太會少。",
    sectors: ["醫療保健", "金融"], chains: ["healthcare", "finance"],
    examples: "禮來、嬌生、美敦力、國泰金",
    watch: "新藥有沒有通過、健保和藥價政策。",
    careful: "新藥研發常失敗，政府壓藥價也會讓藥廠少賺。",
  },
  {
    key: "power", icon: "⚡", name: "缺電與能源轉型",
    what: "AI 資料中心、電動車都很吃電，各國又要減碳，所以要蓋更多綠電、電網和儲能。",
    sectors: ["公用事業", "工業", "能源"], chains: ["energy", "industrial"],
    examples: "台達電、華城、奇異維諾瓦、新紀元能源",
    watch: "用電量成長、政府能源政策、電價。",
    careful: "很靠政策和補貼，利率高時蓋電廠的成本也變高。",
  },
  {
    key: "supply", icon: "🌏", name: "供應鏈搬家",
    what: "美中對立、關稅和疫情經驗，讓工廠從中國搬到美國、墨西哥、東南亞和台灣，叫「去全球化」。",
    sectors: ["工業", "原材料", "資訊科技"], chains: ["industrial", "semi-ai"],
    examples: "鴻海、台積電美國廠、卡特彼勒",
    watch: "關稅新聞、各國蓋廠補貼、海外工廠的進度。",
    careful: "搬家很花錢，新廠成本比較高，短期可能讓毛利變差。",
  },
  {
    key: "ev", icon: "🔋", name: "電動車與自駕",
    what: "車子從燒油改成用電，再慢慢變成會自己開的電腦，需要電池、功率晶片和軟體。",
    sectors: ["非必需消費", "資訊科技", "原材料"], chains: ["ev"],
    examples: "特斯拉、比亞迪、台達電",
    watch: "每月電動車賣多少台、電池價格。",
    careful: "價格戰很兇，補貼一退，銷量和車廠獲利都可能下滑。",
  },
  {
    key: "digital", icon: "📱", name: "數位生活與訂閱",
    what: "看劇、聽音樂、付款、買東西、上課都搬到手機上，平台按月收費或賺廣告。",
    sectors: ["通訊服務", "資訊科技", "金融"], chains: ["telecom-media", "cloud-software", "finance"],
    examples: "Netflix、Google、Visa、中華電信",
    watch: "訂閱人數、每個用戶付多少錢。",
    careful: "用戶成長到頂後，靠漲價撐營收；新的競爭者也很多。",
  },
];
