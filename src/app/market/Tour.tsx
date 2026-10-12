"use client";

import { useCallback, useEffect, useState } from "react";
import { TOUR } from "@/lib/tour";

const DONE_KEY = "market.tour.v1";

// 找畫面上的目標；資料還在讀取時多等一下。
function findTarget(target: string, level: number, tries = 15): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const look = (n: number) => {
      const el = document.querySelector<HTMLElement>(
        ["compass", "chips", "ask"].includes(target) ? `[data-tour="${target}"]` : `#hub-panel[data-level="${level}"] [data-tour="${target}"]`,
      );
      if (el || n <= 0) resolve(el);
      else setTimeout(() => look(n - 1), 200);
    };
    look(tries);
  });
}

// 導覽：下方一張說明卡，自動換到該關、把要看的地方框起來並捲到畫面上方。
export default function Tour({ go }: { go: (level: number) => void }) {
  const [i, setI] = useState<number | null>(null);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(DONE_KEY) === "done";
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 第一次來才自動開始，要等掛載後讀 localStorage
    if (!seen) setI(0);
    const start = () => setI(0);
    window.addEventListener("market-tour", start);
    return () => window.removeEventListener("market-tour", start);
  }, []);

  const close = useCallback(() => {
    setI(null);
    try {
      localStorage.setItem(DONE_KEY, "done");
    } catch {}
  }, []);

  useEffect(() => {
    if (i === null) return;
    const step = TOUR[i];
    let el: HTMLElement | null = null;
    let alive = true;
    go(step.level);
    findTarget(step.target, step.level).then((found) => {
      if (!alive || !found) return;
      el = found;
      el.classList.add("tour-focus");
      const top = el.getBoundingClientRect().top + window.scrollY - (step.target === "chips" ? 0 : 70);
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
    return () => {
      alive = false;
      el?.classList.remove("tour-focus");
    };
  }, [i, go]);

  if (i === null) return null;
  const step = TOUR[i];
  const last = i === TOUR.length - 1;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 p-3">
      <div
        key={i}
        className="animate-rise mx-auto max-w-lg space-y-2 rounded-xl bg-zinc-900 p-4 text-sm text-white shadow-2xl dark:bg-zinc-100 dark:text-zinc-900"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold">{step.title}</p>
          <span className="shrink-0 text-xs opacity-60">
            導覽 {i + 1} / {TOUR.length}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/20 dark:bg-zinc-900/20">
          <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${((i + 1) / TOUR.length) * 100}%` }} />
        </div>
        <p className="leading-relaxed opacity-90">{step.body}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <button onClick={close} className="text-xs opacity-60 underline">
            跳過導覽
          </button>
          <div className="flex gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)} className="rounded-full bg-white/15 px-3 py-1.5 dark:bg-zinc-900/10">
                上一步
              </button>
            )}
            <button
              onClick={() => (last ? close() : setI(i + 1))}
              className="rounded-full bg-amber-400 px-4 py-1.5 font-medium text-zinc-900"
            >
              {last ? "完成" : "下一步"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
