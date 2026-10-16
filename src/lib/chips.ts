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

// ── 鎮上氣氛燈：外資和投信這五天加起來，再看鎮民有沒有追著借錢 ──
export type Mood = { light: "green" | "yellow" | "red"; name: string; line: string };

const sum5 = (days: Day[], p: Player) => days.slice(-5).reduce((s, d) => s + d.net[p], 0);

export function mood(days: Day[], marginChange: number | null): Mood | null {
  if (days.length === 0) return null;
  const f = sum5(days, "foreign");
  const t = sum5(days, "trust");
  const m = marginChange ?? 0;
  const fw = `外資這五天${f >= 0 ? "運進" : "搬走"} ${Math.abs(f).toFixed(0)} 億`;
  if (f <= -500 && m > 0) return { light: "red", name: "大戶撤退、鎮民在接", line: `${fw}，鎮民卻還在借錢買，最要小心。` };
  if (f <= -500) return { light: "red", name: "大戶撤退", line: `${fw}，先別急著進場。` };
  if (f >= 500 && m > 0) return { light: "yellow", name: "全鎮都很熱", line: `${fw}，鎮民也跟著借錢買，好但有點過熱。` };
  if (f >= 500 || (f > 0 && t > 0)) return { light: "green", name: "大戶進場", line: `${fw}，投信${t >= 0 ? "也在買" : "在賣"}，氣氛偏好。` };
  return { light: "yellow", name: "大戶觀望", line: `${fw}，方向還不清楚，等連續幾天再說。` };
}

// ── 每日大戶劇場：把今天的數字寫成四格小故事 ──
export interface Scene {
  icon: string;
  title: string;
  text: string;
}

export function story(days: Day[], margin: { change: number } | null, hot?: { buy?: string; sell?: string }): Scene[] {
  const last = days.at(-1);
  if (!last) return [];
  const f = last.net.foreign;
  const t = last.net.trust;
  const sf = streak(days, "foreign");
  const big = (v: number) => Math.abs(v).toFixed(0);
  const scenes: Scene[] = [];
  scenes.push({
    icon: "✈️",
    title: Math.abs(f) < 30 ? "外地商隊在旁邊看" : f > 0 ? "外地商隊運錢進來" : "外地商隊把錢搬走",
    text:
      (Math.abs(f) < 30 ? `今天外資只動了 ${big(f)} 億，沒什麼動作。` : `今天外資${f > 0 ? "買進" : "賣出"} ${big(f)} 億`) +
      (Math.abs(sf) >= 2 ? `，已經連續${sf > 0 ? "買" : "賣"} ${Math.abs(sf)} 天。` : "。") +
      (hot?.buy && f > 0 ? `最愛逛的是「${hot.buy}」。` : hot?.sell && f < 0 ? `搬最多的是「${hot.sell}」。` : ""),
  });
  scenes.push({
    icon: "💵",
    title: f < -100 ? "新台幣被換走" : f > 100 ? "新台幣被搶著換" : "換錢攤很平靜",
    text: f < -100 ? "商隊要把台幣換成美元帶走，新台幣容易變弱。" : f > 100 ? "商隊要先換台幣才能買店，新台幣容易變強。" : "商隊沒什麼進出，匯率也比較安靜。",
  });
  scenes.push({
    icon: "🧺",
    title: t > 0 ? "基金店長在進貨" : "基金店長在出貨",
    text: `投信${t > 0 ? "買進" : "賣出"} ${big(t)} 億。${f * t < 0 ? "跟外資方向相反，兩個大戶意見不同。" : "跟外資同一個方向。"}`,
  });
  const m = margin?.change ?? null;
  const end =
    m === null
      ? f > 0
        ? "大戶在買，跟著看就好，別忘了停損。"
        : "大戶在賣，先觀察，不急著接。"
      : f < 0 && m > 0
        ? "大戶在賣、鎮民在借錢接，這種時候最要小心。"
        : f > 0 && m <= 0
          ? "大戶進場、鎮民還在怕，常是比較健康的時候。"
          : f > 0
            ? "大戶和鎮民一起買，全鎮很熱，好但別追太高。"
            : "大戶和鎮民一起退，等方向清楚再說。";
  scenes.push({
    icon: "🙋",
    title: m === null ? "鎮長的提醒" : m > 0 ? "鎮民還在借錢買" : "鎮民在還錢",
    text: (m === null ? "" : `融資比前一天${m > 0 ? "多" : "少"} ${big(m)} 億。`) + end,
  });
  return scenes;
}

// ── 大戶逛街地圖：證交所每檔的外資、投信買賣超（股數）× 收盤價，加總到每條街（產業） ──
export const STREETS: Record<string, { name: string; icon: string }> = {
  ETF: { name: "整條街都買（指數基金）", icon: "🧺" },
  "01": { name: "水泥", icon: "🧱" },
  "02": { name: "食品", icon: "🍜" },
  "03": { name: "塑膠", icon: "🧴" },
  "04": { name: "紡織", icon: "🧵" },
  "05": { name: "電機機械", icon: "⚙️" },
  "06": { name: "電器電纜", icon: "🔌" },
  "08": { name: "玻璃陶瓷", icon: "🏺" },
  "09": { name: "造紙", icon: "📄" },
  "10": { name: "鋼鐵", icon: "🔩" },
  "11": { name: "橡膠", icon: "🛞" },
  "12": { name: "汽車", icon: "🚗" },
  "14": { name: "建材營造", icon: "🏗️" },
  "15": { name: "航運", icon: "🚢" },
  "16": { name: "觀光餐旅", icon: "🏨" },
  "17": { name: "金融保險", icon: "🏦" },
  "18": { name: "貿易百貨", icon: "🛍️" },
  "20": { name: "其他", icon: "📦" },
  "21": { name: "化學", icon: "🧪" },
  "22": { name: "生技醫療", icon: "💊" },
  "23": { name: "油電燃氣", icon: "⛽" },
  "24": { name: "半導體", icon: "💾" },
  "25": { name: "電腦週邊", icon: "🖥️" },
  "26": { name: "光電", icon: "💡" },
  "27": { name: "通信網路", icon: "📡" },
  "28": { name: "電子零組件", icon: "🔋" },
  "29": { name: "電子通路", icon: "🚚" },
  "30": { name: "資訊服務", icon: "💻" },
  "31": { name: "其他電子", icon: "📟" },
  "32": { name: "文化創意", icon: "🎨" },
  "33": { name: "農業科技", icon: "🌱" },
  "35": { name: "綠能環保", icon: "♻️" },
  "36": { name: "數位雲端", icon: "☁️" },
  "37": { name: "運動休閒", icon: "⚽" },
  "38": { name: "居家生活", icon: "🛋️" },
};

export interface Shop {
  code: string;
  name: string;
  /** 億元 */
  foreign: number;
  trust: number;
}
export interface Street {
  id: string;
  name: string;
  icon: string;
  foreign: number;
  trust: number;
  shops: Shop[];
}

const num = (s: unknown) => Number(String(s ?? "").replace(/,/g, "")) || 0;

/** 證交所 T86（三大法人買賣超日報）＋收盤價＋產業別 → 每條街 */
export function parseStreets(
  t86: { fields?: string[]; data?: unknown[][] },
  prices: { Code: string; ClosingPrice: string }[],
  companies: { 公司代號: string; 產業別: string }[],
): Street[] {
  const fields = t86.fields ?? [];
  const iF = fields.findIndex((f) => f.includes("外陸資買賣超"));
  const iT = fields.findIndex((f) => f.includes("投信買賣超"));
  if (iF < 0 || iT < 0) return [];
  const price = new Map(prices.map((p) => [p.Code, num(p.ClosingPrice)]));
  const ind = new Map(companies.map((c) => [String(c.公司代號).trim(), String(c.產業別).trim()]));
  const streets = new Map<string, Street>();
  for (const row of t86.data ?? []) {
    const code = String(row[0]).trim();
    const p = price.get(code);
    if (!p) continue;
    const id = code.startsWith("00") ? "ETF" : (ind.get(code) ?? "20");
    const meta = STREETS[id] ?? STREETS["20"];
    const shop: Shop = { code, name: String(row[1]).trim(), foreign: (num(row[iF]) * p) / 1e8, trust: (num(row[iT]) * p) / 1e8 };
    const s = streets.get(id) ?? { id, name: meta.name, icon: meta.icon, foreign: 0, trust: 0, shops: [] };
    s.foreign += shop.foreign;
    s.trust += shop.trust;
    s.shops.push(shop);
    streets.set(id, s);
  }
  return [...streets.values()]
    .map((s) => ({ ...s, shops: [...s.shops].sort((a, b) => Math.abs(b.foreign + b.trust) - Math.abs(a.foreign + a.trust)).slice(0, 5) }))
    .sort((a, b) => Math.abs(b.foreign) - Math.abs(a.foreign));
}

/** 外資最愛（買最多）和搬最多（賣最多）的街 */
export function hotStreets(streets: Street[]) {
  const by = [...streets].sort((a, b) => b.foreign - a.foreign);
  return { buy: by[0]?.foreign > 0 ? by[0].name : undefined, sell: by.at(-1) && by.at(-1)!.foreign < 0 ? by.at(-1)!.name : undefined };
}
