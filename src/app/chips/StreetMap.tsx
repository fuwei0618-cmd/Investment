"use client";

import { useState } from "react";
import type { Street } from "@/lib/chips";

const yi = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(Math.abs(n) < 10 ? 1 : 0)} 億`;
// 台股習慣：紅色是買、綠色是賣；越深代表金額越大
function tone(v: number, max: number) {
  const k = Math.min(1, Math.abs(v) / max);
  const step = k > 0.66 ? 3 : k > 0.33 ? 2 : k > 0.05 ? 1 : 0;
  const red = ["bg-stone-100 dark:bg-stone-800", "bg-red-50 dark:bg-red-950/40", "bg-red-100 dark:bg-red-900/50", "bg-red-200 dark:bg-red-800/60"];
  const green = ["bg-stone-100 dark:bg-stone-800", "bg-emerald-50 dark:bg-emerald-950/40", "bg-emerald-100 dark:bg-emerald-900/50", "bg-emerald-200 dark:bg-emerald-800/60"];
  return v >= 0 ? red[step] : green[step];
}

export default function StreetMap({ streets }: { streets: Street[] }) {
  const [pick, setPick] = useState<string | null>(streets[0]?.id ?? null);
  const max = Math.max(...streets.map((s) => Math.abs(s.foreign)), 1);
  const byBuy = [...streets].sort((a, b) => b.foreign - a.foreign);
  const caravan = new Set(byBuy.slice(0, 3).filter((s) => s.foreign > 0).map((s) => s.id));
  const keeper = new Set([...streets].sort((a, b) => b.trust - a.trust).slice(0, 3).filter((s) => s.trust > 0).map((s) => s.id));
  const sel = streets.find((s) => s.id === pick);
  return (
    <div className="space-y-2">
      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
        {streets.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => setPick(s.id)}
              aria-pressed={pick === s.id}
              className={`relative w-full rounded-xl p-2 text-left text-xs transition hover:-translate-y-0.5 ${tone(s.foreign, max)} ${pick === s.id ? "ring-2 ring-stone-800 dark:ring-white" : ""}`}
            >
              <span className="absolute right-1.5 top-1 text-sm">
                {caravan.has(s.id) && "✈️"}
                {keeper.has(s.id) && "🧺"}
              </span>
              <span className="text-lg leading-none">{s.icon}</span>
              <b className="block truncate text-[13px]">{s.name}</b>
              <span className="tabular-nums text-stone-600 dark:text-stone-300">外資 {yi(s.foreign)}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-500">紅色是外資在買、綠色是在賣，越深金額越大。✈️ 是外資今天最愛的三條街，🧺 是投信最愛的三條街。點一條街看大戶買賣最多的店。</p>
      {sel && (
        <div className="animate-rise rounded-xl bg-[#f3ead8] p-2.5 text-sm dark:bg-[#2f281f]">
          <b>
            {sel.icon} {sel.name}：外資 {yi(sel.foreign)}、投信 {yi(sel.trust)}
          </b>
          <ul className="mt-1.5 grid gap-1 sm:grid-cols-2 lg:grid-cols-5">
            {sel.shops.map((p) => (
              <li key={p.code} className="rounded-lg bg-white/70 px-2 py-1 dark:bg-black/20">
                <span className="font-semibold">{p.name}</span> <span className="text-xs text-stone-500">{p.code}</span>
                <span className="block text-xs tabular-nums">
                  ✈️ <span className={p.foreign >= 0 ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}>{yi(p.foreign)}</span>
                  {"　"}🧺 <span className={p.trust >= 0 ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}>{yi(p.trust)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
