// 盤後 LINE 提醒：把「今天能不能出手」和每檔持股的停損停利狀況寫成一則訊息。
import {
  closeAndMa,
  holdingAlert,
  type Happening,
  type Holding,
  type Verdict,
} from "./desk";

const r2 = (n: number) => Math.round(n * 100) / 100;

export function composeMessage(o: {
  date: string;
  verdict: Verdict;
  taiex: { close: number; ma: number } | null;
  holdings: Holding[];
  prices: Record<string, number>;
  /** 美股：清晨收盤後傳，講的是「今晚」能不能出手 */
  market?: "tw" | "us";
}): string {
  const us = o.market === "us";
  const when = us ? "今晚" : "明天";
  const lines = [
    `【投資羅盤 ${us ? "美股收盤" : "盤後提醒"} ${o.date.slice(5).replace("-", "/")}】`,
  ];
  lines.push(
    `${when}能不能出手：${o.verdict.title.replace("今天", when)}` +
      (o.taiex
        ? `（${us ? "標普 500" : "大盤"} ${closeAndMa(o.taiex.close, o.taiex.ma).join("，月線 ")}）`
        : ""),
  );
  if (!o.holdings.length) {
    lines.push("持股：目前沒有記下來的持股。");
    return lines.join("\n");
  }
  const urgent: string[] = [];
  const fine: string[] = [];
  for (const h of o.holdings) {
    const raw = o.prices[h.code];
    if (!raw) {
      fine.push(`・${h.name} ${h.code}：今天價格抓不到`);
      continue;
    }
    const now = r2(raw);
    const a = holdingAlert(h, now);
    const pct = `${a.pct >= 0 ? "+" : ""}${(a.pct * 100).toFixed(1)}%`;
    if (a.tone === "plain")
      fine.push(`・${h.name} ${h.code} 收 ${now}（${pct}）照計畫抱著`);
    else
      urgent.push(
        `${a.tone === "red" ? "要賣" : "賣一半"}｜${h.name} ${h.code} 收 ${now}（${pct}）：${a.text}`,
      );
  }
  if (urgent.length) lines.push("", "要處理的：", ...urgent);
  if (fine.length) lines.push("", "其他持股：", ...fine);
  return lines.join("\n");
}

/** 盤前提醒：今天能不能出手、今明兩天的大事、策略卡今天全過的股票 */
export function composeMorning(o: {
  date: string;
  verdict: Verdict;
  events: Happening[];
  picks: { title: string; names: string[] }[];
  /** 美股：晚上開盤前傳，多一行標普和恐慌指數 */
  market?: "tw" | "us";
  facts?: string[];
}): string {
  const us = o.market === "us";
  const lines = [
    `【投資羅盤 ${us ? "美股開盤前" : "盤前"} ${o.date.slice(5).replace("-", "/")}】`,
  ];
  const title = us ? o.verdict.title.replace("今天", "今晚") : o.verdict.title;
  lines.push(`${us ? "今晚" : "今天"}能不能出手：${title}`, o.verdict.todo);
  if (o.facts?.length) lines.push(...o.facts);
  if (o.events.length)
    lines.push(
      "",
      "近兩天大事：",
      ...o.events.map(
        (e) =>
          `・${e.date.slice(5).replace("-", "/")}${e.rough ? "前後" : ""} ${e.name}`,
      ),
    );
  if (o.verdict.light !== "red") {
    const any = o.picks.filter((p) => p.names.length);
    lines.push(
      "",
      any.length
        ? "策略卡三個條件全過："
        : `策略卡${us ? "今晚" : "今天"}沒有三個條件全過的股票，不用硬買。`,
      ...any.map((p) => `・${p.title}：${p.names.join("、")}`),
    );
  }
  return lines.join("\n");
}

export interface Quote {
  code: string;
  price: number | null;
  prev: number | null;
}

/**
 * 盤中警報：持股碰到停損、停利，或一天漲跌超過 5%。
 * sent 是今天已經提醒過的（同一檔同一種只提醒一次，省 LINE 則數）。
 */
export function intradayAlerts(
  holdings: Holding[],
  quotes: Quote[],
  sent: string[],
): { keys: string[]; lines: string[] } {
  const keys: string[] = [];
  const lines: string[] = [];
  for (const h of holdings) {
    const q = quotes.find((x) => x.code === h.code);
    if (!q?.price) continue;
    const a = holdingAlert(h, q.price);
    const day = q.prev ? q.price / q.prev - 1 : 0;
    const hits: [string, string][] = [];
    if (a.tone === "red")
      hits.push(["stop", `跌破停損 ${h.stop}，收盤前還在下面就準備賣`]);
    if (a.tone === "green")
      hits.push(["target", `到停利 ${h.target}，可以先賣一半`]);
    if (Math.abs(day) >= 0.05)
      hits.push([
        "move",
        `今天${day > 0 ? "大漲" : "大跌"} ${(Math.abs(day) * 100).toFixed(1)}%，看一下新聞`,
      ]);
    for (const [k, text] of hits) {
      const key = `${h.code}:${k}`;
      if (sent.includes(key)) continue;
      keys.push(key);
      lines.push(`・${h.name} ${h.code} 現價 ${r2(q.price)}：${text}`);
    }
  }
  return { keys, lines };
}
