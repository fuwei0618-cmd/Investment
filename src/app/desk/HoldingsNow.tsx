"use client";

import { holdingAlert } from "@/lib/desk";
import { fmt } from "@/lib/storage";
import { useHoldingQuotes } from "./Holdings";
import Jump from "./Jump";

const EDGE = {
  red: "border-red-500",
  green: "border-emerald-600",
  plain: "border-stone-300 dark:border-stone-600",
};
const DO = {
  red: "照計畫賣掉，不要等它漲回來。",
  green: "到停利了，先賣一半。",
  plain: "照計畫抱著，碰到停損再賣。",
};

/** 昨晚發生什麼的「我手上的」：每一檔離停損多遠、現在該做什麼 */
export default function HoldingsNow({ market }: { market: "tw" | "us" }) {
  const { trades, loaded, quotes } = useHoldingQuotes(market);
  if (!loaded) return null;
  if (!trades.length)
    return (
      <p className="text-sm text-stone-600 dark:text-stone-400">
        你還沒有記下來的持股，不用擔心手上的。
      </p>
    );
  return (
    <ul className="space-y-1.5">
      {trades.map((t) => {
        const q = quotes.find((x) => x.code === t.code);
        const now = q?.price ?? q?.prev ?? null;
        const a = now ? holdingAlert(t, now) : null;
        return (
          <li
            key={t.code}
            className={`space-y-0.5 rounded-xl border-l-4 bg-[#f2f2ee] px-3 py-2 text-sm dark:bg-[#2a2e34] ${EDGE[a?.tone ?? "plain"]}`}
          >
            <p>
              <b>
                {t.name} {t.code}
              </b>
              {now != null && <>　現在 {fmt(now, 2)}</>}　停損 {fmt(t.stop, 2)}
              {a?.tone === "plain" && (
                <>，離停損 {((now! / t.stop - 1) * 100).toFixed(1)}%</>
              )}
            </p>
            <p className="font-bold">
              {a ? DO[a.tone] : "現價抓不到，先看 ⑦。"}
            </p>
          </li>
        );
      })}
      <li className="text-xs text-stone-500">
        要賣或改停損，到 <Jump to="hold">⑦ 持股提醒</Jump>。
      </li>
    </ul>
  );
}
