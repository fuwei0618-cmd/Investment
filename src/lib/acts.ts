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
      { href: "/lottery", name: "股票抽籤", note: "最近哪些新股可以抽、划不划算" },
      { href: "/portfolio", name: "持股健檢", note: "手上的投資健不健康" },
    ],
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
