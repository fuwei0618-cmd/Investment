"use client";

import { useState } from "react";
import { simPnl, simStats, type SimTrade } from "@/lib/dayTrade";
import { fmt, usePersistentState } from "@/lib/storage";

const today = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });

// 當沖模擬紀錄：每天記一筆假裝做的當沖，自動扣成本、算勝率，一個月後看真數字
export default function SimLog() {
  const [list, setList] = usePersistentState<SimTrade[]>("daytrade.sim.v1", []);
  const [d, setD] = useState({ name: "", buy: "", sell: "", lots: "1" });
  const s = simStats(list);
  const buy = Number(d.buy);
  const sell = Number(d.sell);
  const shares = Math.round(Number(d.lots) * 1000);
  const ok = buy > 0 && sell > 0 && shares > 0;
  const days = new Set(list.map((t) => t.date)).size;
  const input =
    "w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2 text-lg dark:border-stone-700 dark:bg-stone-900";

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-600 dark:text-stone-400">
        不用真的下單。盤中看到想做的，就記下「如果現在買、什麼時候賣」的價格，網站自動扣掉手續費和當沖稅。記滿一個月（大約
        20 個交易日），扣完成本還是賺，再來談真的做或自動交易。
      </p>
      <div className="grid gap-2 sm:grid-cols-4">
        {(
          [
            ["name", "股票", "text"],
            ["buy", "買進價", "decimal"],
            ["sell", "賣出價", "decimal"],
            ["lots", "張數", "decimal"],
          ] as const
        ).map(([k, label, mode]) => (
          <label key={k} className="text-sm font-bold">
            {label}
            <input
              inputMode={mode}
              type={mode === "text" ? "text" : "number"}
              className={input}
              value={d[k]}
              onChange={(e) => setD({ ...d, [k]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {ok && (
        <p className="text-sm">
          這筆扣完成本 {fmt(simPnl({ buy, sell, shares }).cost)} 元後
          {simPnl({ buy, sell, shares }).net >= 0 ? "賺" : "賠"}{" "}
          <b>{fmt(Math.abs(simPnl({ buy, sell, shares }).net))}</b> 元
        </p>
      )}
      <button
        disabled={!ok}
        onClick={() => {
          setList([
            {
              id: String(Date.now()),
              date: today(),
              name: d.name.trim() || "未填",
              buy,
              sell,
              shares,
            },
            ...list,
          ]);
          setD({ ...d, name: "", buy: "", sell: "" });
        }}
        className="rounded-full bg-[#b4651e] px-4 py-1.5 font-bold text-white disabled:opacity-40"
      >
        記一筆
      </button>

      {list.length > 0 && (
        <>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["記了幾天", `${days} 天／${s.count} 筆`],
                ["勝率", `${Math.round(s.winRate * 100)}%`],
                ["扣完成本累計", `${s.net >= 0 ? "+" : ""}${fmt(s.net)} 元`],
                ["成本總共吃掉", `${fmt(s.cost)} 元`],
              ] as const
            ).map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl bg-[#f3ead8] px-3 py-2 dark:bg-[#2f281f]"
              >
                <dt className="text-xs text-stone-500">{k}</dt>
                <dd
                  className={`text-lg font-black ${k === "扣完成本累計" ? (s.net >= 0 ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400") : ""}`}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-sm">
            {days < 20
              ? `再記 ${20 - days} 個交易日就有一個月的成績。`
              : s.net > 0
                ? "一個月扣完成本還是賺，這個做法可以考慮小額真做，再來談自動交易。"
                : "一個月扣完成本是賠的。這不是你不夠努力，是當沖本來就很難贏；錢放回策略卡和長期投資比較划算。"}
          </p>
          <ul className="space-y-1.5 text-sm">
            {list.map((t) => {
              const r = simPnl(t);
              return (
                <li
                  key={t.id}
                  className="flex flex-wrap items-baseline gap-x-3 rounded-xl bg-[#f3ead8] px-3 py-2 dark:bg-[#2f281f]"
                >
                  <span className="text-stone-500">{t.date}</span>
                  <b>{t.name}</b>
                  <span>
                    {fmt(t.buy, 2)} → {fmt(t.sell, 2)}，
                    {fmt(t.shares / 1000, t.shares % 1000 ? 3 : 0)} 張
                  </span>
                  <span
                    className={
                      r.net >= 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-green-700 dark:text-green-400"
                    }
                  >
                    {r.net >= 0 ? "賺" : "賠"} {fmt(Math.abs(r.net))}
                  </span>
                  <button
                    onClick={() => setList(list.filter((x) => x.id !== t.id))}
                    className="ml-auto text-xs text-stone-500 underline"
                  >
                    刪除
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
