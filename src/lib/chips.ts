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
// 產業名稱用 FinMind 的公司資料（例如「半導體業」），圖示照關鍵字配
const ICONS: [string, string][] = [
  ["半導體", "💾"], ["電腦", "🖥️"], ["光電", "💡"], ["通信", "📡"], ["零組件", "🔋"], ["通路", "🚚"], ["資訊服務", "💻"], ["其他電子", "📟"],
  ["金融", "🏦"], ["航運", "🚢"], ["鋼鐵", "🔩"], ["塑膠", "🧴"], ["紡織", "🧵"], ["食品", "🍜"], ["水泥", "🧱"], ["建材", "🏗️"],
  ["汽車", "🚗"], ["電機", "⚙️"], ["電器", "🔌"], ["玻璃", "🏺"], ["造紙", "📄"], ["橡膠", "🛞"], ["觀光", "🏨"], ["貿易", "🛍️"],
  ["化學", "🧪"], ["生技", "💊"], ["油電", "⛽"], ["文化", "🎨"], ["農業", "🌱"], ["綠能", "♻️"], ["數位", "☁️"], ["運動", "⚽"], ["居家", "🛋️"],
];
export const ETF_STREET = { name: "整條街都買（指數基金）", icon: "🧺" };
// 太籠統的分類不用（同一家公司常同時掛在這些和細分類）
const VAGUE = new Set(["電子工業", "所有證券", "化學生技醫療", "創新板股票", "創新版股票"]);

const streetName = (cat: string) => cat.replace(/(工業|業|類)$/, "") || cat;
const iconOf = (cat: string) => ICONS.find(([k]) => cat.includes(k))?.[1] ?? "📦";

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
const col = (fields: string[] | undefined, word: string) => (fields ?? []).findIndex((f) => f.includes(word));

// 一行 CSV 拆欄：值可能用雙引號包起來、裡面有逗號（例如 "1,000.00"）
const csvRow = (line: string) => [...line.matchAll(/"([^"]*)"|([^,]+)|(?<=,|^)(?=,|$)/g)].map((m) => m[1] ?? m[2] ?? "");

/** 證交所每日收盤行情（STOCK_DAY_ALL）→ 代號對收盤價。正式站拿到的是 CSV 文字，也接受 JSON */
export function parsePrices(t: string | { fields?: string[]; data?: unknown[][] }): Map<string, number> {
  let fields: string[] | undefined;
  let data: unknown[][] | undefined;
  if (typeof t === "string") {
    const text = t.replace(/^\uFEFF/, "").trim();
    if (text.startsWith("{")) return parsePrices(JSON.parse(text));
    const lines = text.split(/\r?\n/).filter(Boolean);
    fields = csvRow(lines[0] ?? "").map((f) => f.trim());
    data = lines.slice(1).map(csvRow);
  } else ({ fields, data } = t);
  const iC = col(fields, "證券代號");
  const iP = col(fields, "收盤價");
  const m = new Map<string, number>();
  if (iC < 0 || iP < 0) return m;
  for (const r of data ?? []) {
    const p = num(r[iP]);
    if (p > 0) m.set(String(r[iC]).trim(), p);
  }
  return m;
}

/** FinMind 公司資料 → 代號對產業（只取上市、跳過太籠統的分類） */
export function parseIndustry(rows: { stock_id: string; industry_category: string; type?: string }[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of rows) {
    if (r.type && r.type !== "twse") continue;
    const cat = String(r.industry_category ?? "").trim();
    if (!cat || VAGUE.has(cat)) continue;
    m.set(String(r.stock_id).trim(), cat);
  }
  return m;
}

/** 證交所 T86（三大法人買賣超日報）＋收盤價＋產業 → 每條街 */
export function parseStreets(t86: { fields?: string[]; data?: unknown[][] }, price: Map<string, number>, industry: Map<string, string>): Street[] {
  const iF = col(t86.fields, "外陸資買賣超");
  const iT = col(t86.fields, "投信買賣超");
  if (iF < 0 || iT < 0) return [];
  const streets = new Map<string, Street>();
  for (const row of t86.data ?? []) {
    const code = String(row[0]).trim();
    const p = price.get(code);
    if (!p) continue;
    const cat = industry.get(code);
    const etf = code.startsWith("00") || (cat?.includes("ETF") ?? false);
    const id = etf ? "ETF" : (cat ?? "其他");
    const shop: Shop = { code, name: String(row[1]).trim(), foreign: (num(row[iF]) * p) / 1e8, trust: (num(row[iT]) * p) / 1e8 };
    const s = streets.get(id) ?? { id, name: etf ? ETF_STREET.name : streetName(id), icon: etf ? ETF_STREET.icon : iconOf(id), foreign: 0, trust: 0, shops: [] };
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
