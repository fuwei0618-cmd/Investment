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
