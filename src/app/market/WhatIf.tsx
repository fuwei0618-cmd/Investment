"use client";

import { useEffect, useState } from "react";
import { SCENARIOS } from "@/lib/whatif";
import { TILES } from "@/lib/live";

// 選一個情境，因果鏈一格一格亮起來；有對應數字卡的格子附上現在的數字。
export default function WhatIf({ latest }: { latest: Record<string, number | null> }) {
  const [key, setKey] = useState(SCENARIOS[0].key);
  const [shown, setShown] = useState(0);
  const sc = SCENARIOS.find((s) => s.key === key)!;

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i > sc.steps.length) clearInterval(id);
    }, 550);
    return () => {
      clearInterval(id);
      setShown(0);
    };
  }, [sc]);

  return (
    <div data-tour="whatif" className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            onClick={() => setKey(s.key)}
            className={`rounded-full px-3 py-1 text-xs ${
              s.key === key ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            如果{s.title}？
          </button>
        ))}
      </div>
      <ol className="space-y-0">
        {sc.steps.map((st, i) => {
          const tile = st.fred ? TILES.find((t) => t.id === st.fred) : undefined;
          const v = st.fred ? latest[st.fred] : null;
          const on = i < shown;
          return (
            <li key={`${key}-${i}`} className={`transition-all duration-500 ${on ? "opacity-100" : "translate-y-1 opacity-15"}`}>
              {i > 0 && <div className={`ml-4 h-4 w-0.5 ${on ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />}
              <div
                className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm ${
                  on ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <span>
                  <span className="mr-2 text-xs text-blue-600">{i + 1}</span>
                  {st.text}
                </span>
                {tile && v !== null && v !== undefined && (
                  <span className="shrink-0 rounded bg-white px-1.5 text-xs tabular-nums text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    現在 {v.toFixed(tile.digits)}
                    {tile.unit}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p
        className={`rounded-md bg-amber-50 p-3 text-sm transition-opacity duration-500 dark:bg-amber-950 ${
          shown > sc.steps.length ? "opacity-100" : "opacity-0"
        }`}
      >
        所以：{sc.so}
        <span className="mt-1 block text-xs text-zinc-500">課程：{sc.course}</span>
      </p>
    </div>
  );
}
