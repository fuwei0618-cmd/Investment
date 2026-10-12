"use client";

import { useState } from "react";
import { SCENES } from "@/lib/daymap";
import { CHAINS } from "@/lib/chains";
import { openChain, useTailwind } from "./sectorTools";

// 產業情境圖：你的一天從早到晚，每個場景背後是哪個產業、錢流到誰手上、現在順不順風。
export default function DayMap() {
  const [open, setOpen] = useState<number | null>(2);
  const { phaseName, fits } = useTailwind();

  return (
    <div className="space-y-3 text-sm">
      <p>
        你一天花的每一塊錢，最後都流進某個產業。從早到晚走一遍，點一個場景，看錢流到誰手上。
        <span className="ml-1 rounded bg-emerald-100 px-1.5 text-xs text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">順風</span>
        ＝依第 3 關「{phaseName}」期，現在比較有利的產業。
      </p>
      <ol className="relative space-y-2 before:absolute before:top-3 before:bottom-3 before:left-[27px] before:w-1 before:rounded-full before:bg-gradient-to-b before:from-amber-300 before:via-sky-300 before:to-indigo-500">
        {SCENES.map((s, i) => {
          const on = open === i;
          const fit = fits(s.sector);
          const chain = CHAINS.find((c) => c.key === s.chain);
          return (
            <li key={s.time} className="animate-rise relative" style={{ animationDelay: `${i * 70}ms` }}>
              <button onClick={() => setOpen(on ? null : i)} className="flex w-full items-center gap-3 text-left">
                <span
                  className={`relative z-[1] flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 bg-white text-2xl transition-transform dark:bg-zinc-900 ${
                    on ? "scale-110 border-amber-400" : fit ? "border-emerald-500" : "border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {s.icon}
                  <span className="text-[9px] leading-none text-zinc-500">{s.time}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{s.you}</span>
                  <span className="text-xs text-zinc-500">
                    {chain?.title ?? s.sector}
                    {fit && (
                      <span className="ml-1.5 rounded bg-emerald-100 px-1.5 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">順風</span>
                    )}
                  </span>
                </span>
                <span className={`shrink-0 text-zinc-400 transition-transform ${on ? "rotate-90" : ""}`}>›</span>
              </button>
              {on && (
                <div className="animate-rise mt-2 ml-[68px] space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                  <p>{s.behind}</p>
                  <p className="text-xs text-zinc-500">你的錢這樣往上流：</p>
                  <ol className="space-y-1">
                    {s.flow.map((f, j) => (
                      <li key={f.step} className="animate-rise flex gap-2" style={{ animationDelay: `${j * 90}ms` }}>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white dark:bg-zinc-100 dark:text-zinc-900">
                          {j + 1}
                        </span>
                        <span>
                          <span className="text-zinc-500">{f.step}：</span>
                          {f.who}
                        </span>
                      </li>
                    ))}
                  </ol>
                  {chain && (
                    <button onClick={() => openChain(chain.key)} className="text-blue-600">
                      看整條產業鏈：{chain.title} →
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-zinc-500">公司只是例子，不是推薦。</p>
    </div>
  );
}
