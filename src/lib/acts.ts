// 全站架構：麵包鎮小劇場「新鎮民小麥的一天」，六幕＝投資六步。
// 每一頁屬於某一幕；看市場一頁跨三幕，照 #level-N 決定（1–3 關第二幕、4–6 關第四幕、7–8 關第六幕）。
export interface ActPage {
  href: string;
  name: string;
  note: string;
}
export interface Act {
  n: number;
  title: string;
  /** 投資這一步在問什麼 */
  q: string;
  /** 走出這一幕手上多了什麼 */
  take: string;
  pages: ActPage[];
  /** 其他也算這一幕的網址（例如分區首頁） */
  also?: string[];
}

export const ACTS: Act[] = [
  {
    n: 1,
    title: "鎮公所報到",
    q: "我是誰？",
    take: "鎮民證：你是哪一型、能拿多少錢去冒險",
    pages: [
      { href: "/goals", name: "財務目標", note: "退休要多少錢、每月存多少才夠" },
      { href: "/risk", name: "風險屬性", note: "20 題小測驗，算出你是保守還是積極" },
    ],
    also: ["/money"],
  },
  {
    n: 2,
    title: "廣場看天氣",
    q: "現在什麼季節？",
    take: "季節牌：現在是哪一季",
    pages: [
      { href: "/market#level-1", name: "看市場第 1 到 3 關", note: "世界景氣、錢變多變少、現在是哪一季" },
      { href: "/macro", name: "總經數字總覽", note: "利率、通膨、失業率一次看" },
      { href: "/usd", name: "美元專區", note: "美元現在貴不貴、跟客戶怎麼聊" },
    ],
  },
  {
    n: 3,
    title: "逛風險大街",
    q: "用哪些工具？",
    take: "購物清單：住哪幾間、各放多少",
    pages: [
      { href: "/tools", name: "工具卡", note: "每種工具怎麼賺、怎麼賠、怎麼玩" },
      { href: "/tools/seasons", name: "四季總表", note: "每一季哪些工具表現好" },
      { href: "/game/bakery.html", name: "麵包鎮大富翁", note: "用遊戲先玩一圈" },
    ],
  },
  {
    n: 4,
    title: "商店街挑店",
    q: "挑哪條街、哪家店？",
    take: "想逛的那條街，和兩三家店",
    pages: [
      { href: "/market#level-4", name: "看市場第 4 到 6 關", note: "適合的產業、產業鏈、鏈上的公司" },
      { href: "/industry", name: "產業燈號與打分卡", note: "每個產業現在亮什麼燈、幾分" },
    ],
  },
  {
    n: 5,
    title: "大戶劇場",
    q: "大戶在買什麼？",
    take: "大戶是順風還是逆風",
    pages: [{ href: "/chips", name: "大戶劇場", note: "外資、投信在買什麼，逛街地圖、猜猜明天" }],
  },
  {
    n: 6,
    title: "麵包店下單",
    q: "怎麼操作？",
    take: "一張寫好停損的下單卡",
    pages: [
      { href: "/market#level-7", name: "看市場第 7 到 8 關", note: "值多少錢、什麼時候買賣" },
      { href: "/go/tw-stock", name: "帶我做：台股短線", note: "照條件挑股票、算張數、一步一步下單" },
      { href: "/lottery", name: "股票抽籤", note: "最近哪些新股可以抽、划不划算" },
      { href: "/stock", name: "查一檔", note: "打股號，一頁看外資投信、EPS、貴不貴" },
      { href: "/portfolio", name: "持股健檢", note: "手上的投資健不健康" },
    ],
    also: ["/go/tw-trust", "/go/daytrade"],
  },
];

const marketAct = (level: number) => (level <= 3 ? 2 : level <= 6 ? 4 : 6);

/** 這個網址是第幾幕（不在六幕裡回傳 null）。level 是看市場的 #level-N */
export function actOf(pathname: string, level = 1): Act | null {
  if (pathname === "/market") return ACTS[marketAct(level) - 1];
  return ACTS.find((a) => a.pages.some((p) => p.href === pathname) || a.also?.includes(pathname)) ?? null;
}

/** 這一頁在這一幕的哪一個道具（看市場比對關卡範圍） */
export function isHere(p: ActPage, pathname: string, level = 1) {
  const [path, hash] = p.href.split("#");
  if (path !== pathname) return false;
  if (!hash) return true;
  return marketAct(Number(hash.replace("level-", ""))) === marketAct(level);
}

// ── 劇場：每一幕的舞台、角色、台詞（首頁舞台和每頁站牌都用） ──
export interface Cast {
  name: string;
  /** 頭像上的一個字 */
  face: string;
  tone: string;
}
export interface Scene {
  time: string;
  sky: string;
  ground: string;
  /** 背景房子：左邊位置%、寬%、高 px、顏色 */
  houses: { x: number; w: number; h: number; c: string }[];
  cast: Cast[];
  /** [誰說, 台詞]；誰說 用 cast 的索引 */
  lines: [number, string][];
}

const ME: Cast = { name: "小麥（你）", face: "麥", tone: "#c27a2c" };

export const SCENES: Record<number, Scene> = {
  1: {
    time: "早上",
    sky: "#dcebd3",
    ground: "#b9cf9f",
    houses: [
      { x: 4, w: 18, h: 150, c: "#e8d2a8" },
      { x: 48, w: 13, h: 110, c: "#d9c09a" },
    ],
    cast: [{ name: "鎮長", face: "鎮", tone: "#4f7f3a" }, ME],
    lines: [
      [0, "歡迎搬來麵包鎮！先填兩張表：你想存多少錢，還有錢掉一成你睡不睡得著。"],
      [1, "睡不睡得著也要填？"],
      [0, "那就是你的風險屬性。填完發你一張鎮民證，後面每一幕都用得到。"],
    ],
  },
  2: {
    time: "上午",
    sky: "#d3e4ef",
    ground: "#c9d6b0",
    houses: [
      { x: 3, w: 14, h: 100, c: "#e3cfa9" },
      { x: 19, w: 10, h: 170, c: "#cdb48c" },
    ],
    cast: [{ name: "氣象婆婆", face: "婆", tone: "#2f6f8f" }, ME],
    lines: [
      [1, "婆婆，今天適合出門買東西嗎？"],
      [0, "先看三件事：世界景氣好不好、錢變多還是變少、現在是春夏秋冬哪一季。"],
      [0, "美元是外地吹來的風，出門前也看一下風向。"],
    ],
  },
  3: {
    time: "中午",
    sky: "#f3e3c3",
    ground: "#d8c49a",
    houses: [
      { x: 2, w: 10, h: 100, c: "#9fc48a" },
      { x: 13, w: 10, h: 125, c: "#c9c56f" },
      { x: 24, w: 10, h: 150, c: "#e0a95a" },
      { x: 35, w: 10, h: 175, c: "#d9734f" },
    ],
    cast: [{ name: "大街導遊", face: "導", tone: "#8a5a1e" }, ME],
    lines: [
      [0, "這條街越往右越刺激。照你的鎮民證和季節牌，先看亮燈的那幾間。"],
      [1, "每間房子要怎麼住？"],
      [0, "打開卡片有撇步，照風險分也照放多久分。還不確定就去遊樂場玩一圈大富翁。"],
    ],
  },
  4: {
    time: "下午",
    sky: "#eadcf0",
    ground: "#d2c3a0",
    houses: [
      { x: 3, w: 12, h: 130, c: "#d8b8e0" },
      { x: 16, w: 12, h: 105, c: "#e8cfa0" },
      { x: 46, w: 11, h: 125, c: "#c9b0d6" },
    ],
    cast: [{ name: "商店街老闆", face: "老", tone: "#7a4b8c" }, ME],
    lines: [
      [0, "這一季大家最需要什麼？順著需求找到那條街。"],
      [1, "街上那麼多家，要怎麼挑？"],
      [0, "看它在產業鏈的上游還是下游，再看每家店的打分卡。"],
    ],
  },
  5: {
    time: "傍晚",
    sky: "#f6d6c8",
    ground: "#d9b996",
    houses: [
      { x: 2, w: 13, h: 160, c: "#e7b49a" },
      { x: 16, w: 10, h: 115, c: "#d9a07f" },
    ],
    cast: [{ name: "外資大戶", face: "外", tone: "#b23a2e" }, { name: "投信", face: "投", tone: "#3a6f6a" }, ME],
    lines: [
      [0, "這條街我今天整車搬走！"],
      [1, "我比較慢，一間一間挑。"],
      [2, "他們跟我看上的是同一條街嗎？先看氣氛燈和逛街地圖。"],
    ],
  },
  6: {
    time: "晚上",
    sky: "#d9d3ea",
    ground: "#c8b48e",
    houses: [
      { x: 3, w: 19, h: 160, c: "#e9c78f" },
      { x: 50, w: 10, h: 110, c: "#d6b680" },
    ],
    cast: [{ name: "麵包師傅", face: "師", tone: "#a0601a" }, ME],
    lines: [
      [0, "買幾個、多少錢算貴、烤壞了什麼時候收手，先寫好再下單。"],
      [1, "如果我想衝一把呢？"],
      [0, "照六步操作卡，第四步停損先寫好。新股抽籤、回家看持股健不健康，也在這裡。"],
    ],
  },
};
