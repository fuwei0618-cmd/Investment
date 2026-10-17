"use client";

import {
  JOURNAL_KEY,
  pctOf,
  pnlOf,
  stats,
  summary,
  type Closed,
} from "@/lib/journal";
import { fmt, usePersistentState } from "@/lib/storage";

const WHY = { stop: "停損", target: "停利", other: "自己賣" };

/** 最上面一行：跟著做的勝率 */
export function ScoreLine({ market }: { market: "tw" | "us" }) {
  const [journal, , loaded] = usePersistentState<Closed[]>(JOURNAL_KEY, []);
  if (!loaded) return null;
  const list = journal.filter((c) => c.market === market);
  return (
    <p className="text-sm">
      <b>跟著做的成績：</b>
      {list.length
        ? summary(stats(list))
        : "還沒有賣掉的紀錄。持股賣掉後按「賣掉了，記進成績單」，這裡就會算勝率。"}
      {list.length > 0 && (
        <a
          href="#score"
          className="ml-1 text-blue-700 underline dark:text-blue-400"
        >
          看每一筆
        </a>
      )}
    </p>
  );
}

/** 成績單：依策略卡分開算，下面列每一筆 */
export default function Scorecard({ market }: { market: "tw" | "us" }) {
  const [journal, setJournal, loaded] = usePersistentState<Closed[]>(
    JOURNAL_KEY,
    [],
  );
  if (!loaded) return <p className="text-sm text-stone-500">讀取中⋯⋯</p>;
  const list = journal.filter((c) => c.market === market);
  const unit = market === "us" ? "美元" : "元";
  if (!list.length)
    return (
      <p className="text-sm">
        還沒有紀錄。持股賣掉後，在上面「我的持股提醒」按「賣掉了，記進成績單」，填實際成交價就好。
      </p>
    );
  const plays = [...new Set(list.map((c) => c.play))];
  const all = stats(list);
  return (
    <div className="space-y-3 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        {plays.map((p) => {
          const s = stats(list.filter((c) => c.play === p));
          return (
            <div
              key={p}
              className="rounded-xl bg-[#e9e9e4] p-3 dark:bg-[#2a2e34]"
            >
              <b>{p}</b>
              <p>{summary(s)}</p>
              <p>
                總共{s.total >= 0 ? "賺" : "賠"} {fmt(Math.abs(s.total))} {unit}
              </p>
            </div>
          );
        })}
      </div>
      {plays.length > 1 && (
        <p>
          全部加起來：{summary(all)}總共{all.total >= 0 ? "賺" : "賠"}{" "}
          {fmt(Math.abs(all.total))} {unit}。
        </p>
      )}
      <p className="text-xs text-stone-500">
        勝率不用很高：賺的時候賺得比賠的時候多，長期就會賺。只有十幾筆以前，數字還不太準。
      </p>
      <ul className="space-y-1">
        {list.map((c, i) => {
          const pnl = pnlOf(c);
          return (
            <li
              key={`${c.code}-${c.sellDate}-${i}`}
              className="flex flex-wrap items-baseline gap-x-3 border-b border-stone-200 py-1 dark:border-stone-700"
            >
              <b>
                {c.name} {c.code}
              </b>
              <span className="text-stone-500">
                {c.buyDate} → {c.sellDate}（{WHY[c.why]}）
              </span>
              <span>
                {fmt(c.buyPrice, 2)} → {fmt(c.sellPrice, 2)}
              </span>
              <span
                className={
                  pnl >= 0
                    ? "font-bold text-red-700 dark:text-red-400"
                    : "font-bold text-green-700 dark:text-green-400"
                }
              >
                {(pctOf(c) * 100).toFixed(1)}%，{pnl >= 0 ? "賺" : "賠"}{" "}
                {fmt(Math.abs(pnl))} {unit}
              </span>
              <button
                onClick={() => setJournal(journal.filter((x) => x !== c))}
                className="ml-auto text-xs text-stone-500 underline"
              >
                刪除
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
