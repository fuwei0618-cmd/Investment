// 實戰分頁：把景氣、大盤、大戶三盞燈合成「今天能不能出手」，排出近期大事，提醒持股該不該賣。
import type { PhaseKey } from "./industry";
import type { Light } from "./today";

export interface Verdict {
  light: Light | null;
  title: string;
  todo: string;
}

/**
 * 今天能不能出手：大盤在月線下最優先（策略卡都要求大盤在月線上），
 * 其次看大戶有沒有在買、景氣是不是衰退期。
 */
export function verdict(o: {
  above: boolean | null;
  mood: Light | null;
  season: Light | null;
}): Verdict {
  if (o.above === null)
    return {
      light: null,
      title: "大盤資料暫時抓不到",
      todo: "先不要出手，等資料回來再看。",
    };
  if (!o.above)
    return {
      light: "red",
      title: "今天不買股票",
      todo: "大盤在月線下，策略卡的名單先不用看。想做的話可以走放空（買反向 ETF），或乾脆休息。",
    };
  if (o.mood === "red" || o.season === "red")
    return {
      light: "yellow",
      title: "可以出手，但只用一半的錢",
      todo:
        o.mood === "red"
          ? "大盤還在月線上，但大戶這幾天在搬錢出去。照策略卡挑，每筆只放平常一半。"
          : "大盤還在月線上，但景氣在衰退期。照策略卡挑，每筆只放平常一半。",
    };
  if (o.mood === "green")
    return {
      light: "green",
      title: "可以照策略卡出手",
      todo: "大盤在月線上、大戶也在買。到下面的名單挑符合條件的，照「帶我做」一步一步來。",
    };
  return {
    light: "yellow",
    title: "可以出手，挑最強的一兩檔就好",
    todo: "大盤在月線上，但大戶還在觀望。名單裡三個條件全過的才買，不要一次買很多檔。",
  };
}

/* ── 今天必知大事：固定會發生的行事曆 ── */

export interface Happening {
  date: string; // YYYY-MM-DD（台灣時間）
  name: string;
  why: string;
  rough?: boolean; // 只知道大約時間
  only?: "tw" | "us"; // 只跟台股或美股有關
}

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** 某月第 n 個星期幾（0＝週日） */
function nthWeekday(y: number, m: number, wd: number, n: number) {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  return 1 + ((wd - first + 7) % 7) + (n - 1) * 7;
}

// 美國央行開會（官方公布的日程，台灣時間是第二天清晨公布結果）
const FOMC: [string, string][] = [
  ["2026-01-29", "2026-01-28"],
  ["2026-03-19", "2026-03-18"],
  ["2026-04-30", "2026-04-29"],
  ["2026-06-18", "2026-06-17"],
  ["2026-07-30", "2026-07-29"],
  ["2026-09-17", "2026-09-16"],
  ["2026-10-29", "2026-10-28"],
  ["2026-12-10", "2026-12-09"],
];

function monthEvents(y: number, m: number): Happening[] {
  const out: Happening[] = [
    {
      date: iso(y, m, nthWeekday(y, m, 5, 1)),
      name: "美國就業報告",
      why: "看美國人有沒有工作。新增工作太少，市場會擔心景氣變差。",
      rough: true,
    },
    {
      date: iso(y, m, 12),
      name: "美國物價（通膨）數字",
      why: "物價漲太快，央行就不敢降息，股票容易跌。",
      rough: true,
    },
    {
      date: iso(y, m, 10),
      name: "台灣上市公司公布上個月營收",
      only: "tw",
      why: "營收大增的公司常會被法人追著買，看你追蹤的股票有沒有成長。",
    },
    {
      date: iso(y, m, nthWeekday(y, m, 3, 3)),
      name: "台指期結算",
      only: "tw",
      why: "期貨到期那天，大盤常會被拉上拉下，短線進出要小心。",
    },
  ];
  // 季底：投信作帳（跟著投信買要在季底前一週出場）
  if (m % 3 === 0) {
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    out.push({
      date: iso(y, m, last - 7),
      name: "季底前一週：投信作帳尾聲",
      only: "tw",
      why: "投信常在季底前拉抬持股，季底後容易賣。照「跟著投信買」的人這週要出場。",
    });
  }
  // 1、4、7、10 月中：台積電法說會、財報季
  if (m % 3 === 1)
    out.push({
      date: iso(y, m, nthWeekday(y, m, 4, 3)),
      name: "台積電法說會（財報季開始）",
      only: "tw",
      why: "台積電佔大盤三成，它對下一季的說法會影響整個電子股。",
      rough: true,
    });
  // 3、6、9、12 月中：台灣央行開會
  if (m % 3 === 0)
    out.push({
      date: iso(y, m, nthWeekday(y, m, 4, 3)),
      name: "台灣央行理監事會",
      only: "tw",
      why: "決定台灣利率和房貸規定，影響金融股和營建股。",
      rough: true,
    });
  // 美股：每月第三個週五選擇權到期（3、6、9、12 月是四巫日），台灣時間隔天清晨收盤
  const opx = nthWeekday(y, m, 5, 3);
  out.push({
    date: iso(y, m, opx),
    name: m % 3 === 0 ? "美股四巫日（期貨選擇權一起到期）" : "美股選擇權到期",
    why: "大量合約同一天到期，收盤前股價常被拉來拉去，成交量特別大。",
    only: "us",
  });
  // 1、4、7、10 月中：美股財報季開始（大銀行先公布）
  if (m % 3 === 1)
    out.push({
      date: iso(y, m, nthWeekday(y, m, 5, 2)),
      name: "美股財報季開始（大銀行先公布）",
      why: "接下來一個月每家公司都公布成績單，財報前後股價常一天漲跌一成，持股要先知道日子。",
      only: "us",
      rough: true,
    });
  return out;
}

/** 從今天起 days 天內的大事，依日期排；給 market 就只留跟那邊有關的 */
export function upcoming(
  today: string,
  days = 30,
  market?: "tw" | "us",
): Happening[] {
  const [y, m] = today.split("-").map(Number);
  const next = m === 12 ? [y + 1, 1] : [y, m + 1];
  const end = new Date(Date.parse(today) + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const fomc: Happening[] = FOMC.map(([d]) => ({
    date: d,
    name: "美國央行公布利率（台灣時間清晨）",
    why: "降息＝放錢、升息＝收錢，是全世界股市最在意的一天。",
  }));
  return [...monthEvents(y, m), ...monthEvents(next[0], next[1]), ...fomc]
    .filter((e) => e.date >= today && e.date <= end)
    .filter((e) => !market || !e.only || e.only === market)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/* ── 我的持股提醒 ── */

export interface Holding {
  saved: string;
  code: string;
  name: string;
  price: number;
  shares: number;
  stop: number;
  target: number;
  /** 哪一張策略卡（成績單分開算） */
  play?: string;
}

export interface Alert {
  tone: "red" | "green" | "plain";
  text: string;
  /** 現在賺賠（元） */
  pnl: number;
  pct: number;
}

export function holdingAlert(h: Holding, now: number): Alert {
  const pnl = Math.round((now - h.price) * h.shares);
  const pct = now / h.price - 1;
  if (now <= h.stop)
    return {
      tone: "red",
      pnl,
      pct,
      text: `已經跌破停損價 ${h.stop}，照計畫要賣掉，不要等它漲回來。`,
    };
  if (now >= h.target)
    return {
      tone: "green",
      pnl,
      pct,
      text: `已經到停利價 ${h.target}，照計畫先賣一半，剩下照策略卡的出場規則。`,
    };
  const toStop = now / h.stop - 1;
  return {
    tone: "plain",
    pnl,
    pct,
    text: `還在計畫裡：離停損還有 ${(toStop * 100).toFixed(1)}%，離停利還差 ${((h.target / now - 1) * 100).toFixed(1)}%。`,
  };
}

/** 台灣時間的今天（YYYY-MM-DD） */
export const taipeiToday = (now = new Date()) =>
  new Date(now.getTime() + 8 * 3_600_000).toISOString().slice(0, 10);

/** 收盤和月線兩個數字：四捨五入後看起來一樣時多給兩位小數，才看得出誰在上面 */
export function closeAndMa(close: number, ma: number): [string, string] {
  const d = Math.round(close) === Math.round(ma) ? 2 : 0;
  return [close.toFixed(d), ma.toFixed(d)];
}

/* ── 景氣四季各自最適合的工具（景氣時鐘，又叫美林時鐘） ── */

export const SEASON_TOOLS: Record<
  PhaseKey,
  { name: string; tools: string; why: string }
> = {
  recovery: {
    name: "復甦",
    tools: "股票、整條街（指數 ETF）",
    why: "公司賺錢開始變多、利率還低，是股票最好賺的時候。",
  },
  expansion: {
    name: "擴張",
    tools: "股票挑強的、黃金、原物料",
    why: "東西越賣越貴，抓實物的工具跟著漲；股票還能抱，但只挑還在成長的。",
  },
  slowdown: {
    name: "趨緩",
    tools: "定存、現金，股票減一點",
    why: "央行不敢降息，股票和債券都不好過，先把現金留起來。",
  },
  recession: {
    name: "衰退",
    tools: "借錢給人（債券）、現金",
    why: "央行開始降息，債券會漲；股票先少買，等轉向復甦再進場。",
  },
};
