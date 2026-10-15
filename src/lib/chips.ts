// 麵包鎮的大戶：台股每天收盤後公布的「三大法人買賣超」和「融資」。
// 這裡只放整理資料的純函式，抓資料在 chipsData.ts。

export type Player = "foreign" | "trust" | "dealer";

export const PLAYERS: { id: Player; icon: string; name: string; town: string; term: string; how: string; watch: string }[] = [
  {
    id: "foreign",
    icon: "✈️",
    name: "外資",
    town: "外地來的大商隊",
    term: "外國機構投資人",
    how: "錢最多，最愛買台積電這種大店。他們進出台灣要換錢，所以會讓新台幣變強或變弱。",
    watch: "連續好幾天買超，常代表全世界看好台灣；突然大賣，常是全世界在躲風險。",
  },
  {
    id: "trust",
    icon: "🧺",
    name: "投信",
    town: "鎮上的基金店長",
    term: "國內投資信託公司",
    how: "替買基金的鎮民挑店，比較愛中小型、有新題材的店。",
    watch: "連續買同一家小店，那家店常會漲一段；季底、年底會把自己手上的店價錢拉高（作帳）。",
  },
  {
    id: "dealer",
    icon: "🎲",
    name: "自營商",
    town: "券商自己下場的夥計",
    term: "證券商自有資金",
    how: "用券商自己的錢買賣，進出很快，很多是為了避險。",
    watch: "三個裡面參考價值最低，看看就好。",
  },
];

// FinMind 的名字對到三種大戶（外資自營商算外資，自營商避險算自營商）
const NAME_OF: Record<string, Player> = {
  Foreign_Investor: "foreign",
  Foreign_Dealer_Self: "foreign",
  Investment_Trust: "trust",
  Dealer_self: "dealer",
  Dealer_Hedging: "dealer",
};

export interface Day {
  date: string;
  /** 買超（正）或賣超（負），單位：億元 */
  net: Record<Player, number>;
}

export function parseInstitutional(rows: { date: string; name: string; buy: number; sell: number }[]): Day[] {
  const days = new Map<string, Day>();
  for (const r of rows) {
    const p = NAME_OF[r.name];
    if (!p) continue;
    const d = days.get(r.date) ?? { date: r.date, net: { foreign: 0, trust: 0, dealer: 0 } };
    d.net[p] += (r.buy - r.sell) / 1e8;
    days.set(r.date, d);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** 最近連續買超（正）或賣超（負）幾天 */
export function streak(days: Day[], p: Player): number {
  let n = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const v = days[i].net[p];
    if (v === 0) break;
    if (n === 0) n = v > 0 ? 1 : -1;
    else if (v > 0 === n > 0) n += n > 0 ? 1 : -1;
    else break;
  }
  return n;
}

/** 融資餘額（億元）：今天和前一天 */
export function parseMargin(rows: { date: string; name: string; TodayBalance: number; YesBalance: number }[]) {
  const last = rows.filter((r) => r.name === "MarginPurchaseMoney").at(-1);
  if (!last) return null;
  return { date: last.date, today: last.TodayBalance / 1e8, change: (last.TodayBalance - last.YesBalance) / 1e8 };
}
