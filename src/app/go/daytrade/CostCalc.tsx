"use client";

import { useState } from "react";
import { breakEven } from "@/lib/dayTrade";
import { fmt } from "@/lib/storage";

// 當沖成本試算：輸入股價、張數、手續費折扣，算出要漲多少才打平
export default function CostCalc() {
  const [price, setPrice] = useState(66.9);
  const [lots, setLots] = useState(1);
  const [disc, setDisc] = useState(10);
  const r = breakEven(price, lots * 1000, Math.min(10, Math.max(1, disc)) / 10);
  const input =
    "w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2 text-lg dark:border-stone-700 dark:bg-stone-900";
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-sm font-bold">
          股價（元）
          <input
            type="number"
            inputMode="decimal"
            className={input}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </label>
        <label className="text-sm font-bold">
          張數
          <input
            type="number"
            inputMode="numeric"
            className={input}
            value={lots || ""}
            onChange={(e) => setLots(Number(e.target.value))}
          />
        </label>
        <label className="text-sm font-bold">
          手續費折扣（6 折填 6，沒折扣填 10）
          <input
            type="number"
            inputMode="decimal"
            className={input}
            value={disc || ""}
            onChange={(e) => setDisc(Number(e.target.value))}
          />
        </label>
      </div>
      {price > 0 && lots > 0 && (
        <dl className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]">
            <dt className="text-xs font-bold">一買一賣的成本</dt>
            <dd className="text-2xl font-black">{fmt(r.cost)} 元</dd>
            <dd className="text-xs text-stone-500">
              手續費 {fmt(r.fees)}＋證交稅 {fmt(r.tax)}（買賣金額{" "}
              {fmt(r.amount)} 元）
            </dd>
          </div>
          <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
            <dt className="text-xs font-bold">要漲多少才打平</dt>
            <dd className="text-2xl font-black text-red-700 dark:text-red-400">
              {(r.pct * 100).toFixed(2)}%
            </dd>
            <dd className="text-xs text-stone-500">
              股價大約要到 {fmt(price * (1 + r.pct), 2)}
            </dd>
          </div>
          <div className="rounded-xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]">
            <dt className="text-xs font-bold">換成「檔」</dt>
            <dd className="text-2xl font-black">{r.ticks} 檔</dd>
            <dd className="text-xs text-stone-500">
              這個價位一檔是 {r.tick} 元，漲不到 {r.ticks} 檔就是白做
            </dd>
          </div>
        </dl>
      )}
      <p className="text-xs text-stone-500">
        手續費 0.1425% 買賣各收一次、最低 20 元；當沖證交稅目前減半為
        0.15%，賣出時收。實際折扣看你的券商。
      </p>
    </div>
  );
}
