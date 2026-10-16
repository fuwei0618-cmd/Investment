// 盤後 LINE 提醒：把「今天能不能出手」和每檔持股的停損停利狀況寫成一則訊息。
import { holdingAlert, type Holding, type Verdict } from "./desk";

export function composeMessage(o: {
  date: string;
  verdict: Verdict;
  taiex: { close: number; ma: number } | null;
  holdings: Holding[];
  prices: Record<string, number>;
}): string {
  const lines = [`【投資羅盤 盤後提醒 ${o.date.slice(5).replace("-", "/")}】`];
  lines.push(
    `明天能不能出手：${o.verdict.title.replace("今天", "明天")}` +
      (o.taiex
        ? `（大盤 ${Math.round(o.taiex.close)}，月線 ${Math.round(o.taiex.ma)}）`
        : ""),
  );
  if (!o.holdings.length) {
    lines.push("持股：目前沒有記下來的持股。");
    return lines.join("\n");
  }
  const urgent: string[] = [];
  const fine: string[] = [];
  for (const h of o.holdings) {
    const now = o.prices[h.code];
    if (!now) {
      fine.push(`・${h.name} ${h.code}：今天價格抓不到`);
      continue;
    }
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
