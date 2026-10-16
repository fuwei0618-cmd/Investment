"use client";

import { useCallback, useEffect, useState } from "react";
import Tour from "./Tour";

export interface HubStep {
  step: number;
  short: string; // 羅盤上的兩三個字
  question: string;
  group: "world" | "industry" | "company";
}

const GROUP = {
  world: { name: "看世界", fill: "fill-sky-500", soft: "fill-sky-500/15", chip: "bg-sky-600" },
  industry: { name: "看產業", fill: "fill-emerald-500", soft: "fill-emerald-500/15", chip: "bg-emerald-600" },
  company: { name: "看公司", fill: "fill-amber-500", soft: "fill-amber-500/15", chip: "bg-amber-600" },
} as const;

const S = 320;
const C = S / 2;
const R = 150;
const r = 62;

function wedge(i: number, n: number) {
  const a0 = ((i / n) * 360 - 90 - 180 / n) * (Math.PI / 180);
  const a1 = (((i + 1) / n) * 360 - 90 - 180 / n) * (Math.PI / 180);
  const p = (rad: number, a: number) => `${(C + rad * Math.cos(a)).toFixed(1)},${(C + rad * Math.sin(a)).toFixed(1)}`;
  return `M${p(r, a0)} L${p(R, a0)} A${R},${R} 0 0 1 ${p(R, a1)} L${p(r, a1)} A${r},${r} 0 0 0 ${p(r, a0)} Z`;
}

function fromHash() {
  const m = typeof window !== "undefined" ? window.location.hash.match(/level-(\d)/) : null;
  return m ? Number(m[1]) : 1;
}

// 看市場最上面的羅盤：8 格就是 8 個主題按鈕，指針轉到哪一關，下面就只顯示那一關。
export default function CompassHub({ steps, panels }: { steps: HubStep[]; panels: React.ReactNode[] }) {
  const [cur, setCur] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 掛載後才讀得到網址上的 #level-N
    setCur(fromHash());
    const onHash = () => {
      setCur(fromHash());
      document.getElementById("hub-panel")?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const tourGo = useCallback((n: number) => {
    history.replaceState(null, "", `#level-${n}`);
    window.dispatchEvent(new Event("levelchange")); // 讓上面的「第幾幕」站牌跟著換
    setCur(n);
  }, []);

  function go(n: number, scroll = false) {
    history.replaceState(null, "", `#level-${n}`);
    window.dispatchEvent(new Event("levelchange")); // 讓上面的「第幾幕」站牌跟著換
    setCur(n);
    if (scroll) document.getElementById("hub-panel")?.scrollIntoView({ behavior: "smooth" });
  }

  const n = steps.length;
  const now = steps[cur - 1];
  return (
    <div className="space-y-4 pb-48">
      <Tour go={tourGo} />
      <section data-tour="compass" className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-xs">
          <svg viewBox={`0 0 ${S} ${S}`} className="w-full select-none">
            {steps.map((s, i) => {
              const g = GROUP[s.group];
              const on = s.step === cur;
              const mid = ((i / n) * 360 - 90) * (Math.PI / 180);
              const lx = C + ((R + r) / 2) * Math.cos(mid);
              const ly = C + ((R + r) / 2) * Math.sin(mid);
              return (
                <g key={s.step} onClick={() => go(s.step)} className="cursor-pointer">
                  <path d={wedge(i, n)} className={`${on ? g.fill : g.soft} stroke-white transition-colors dark:stroke-zinc-900`} strokeWidth={3} />
                  <text x={lx} y={ly - 4} textAnchor="middle" className={`text-[15px] font-bold ${on ? "fill-white" : "fill-zinc-700 dark:fill-zinc-200"}`}>
                    {s.step}
                  </text>
                  <text x={lx} y={ly + 13} textAnchor="middle" className={`text-[11px] ${on ? "fill-white" : "fill-zinc-600 dark:fill-zinc-300"}`}>
                    {s.short}
                  </text>
                </g>
              );
            })}
            <g style={{ transform: `rotate(${((cur - 1) / n) * 360}deg)`, transformOrigin: `${C}px ${C}px`, transition: "transform 600ms cubic-bezier(.3,1.4,.5,1)" }}>
              <polygon points={`${C},${C - r + 6} ${C - 7},${C} ${C + 7},${C}`} className="fill-red-500" />
              <polygon points={`${C},${C + r - 20} ${C - 7},${C} ${C + 7},${C}`} className="fill-zinc-400" />
            </g>
            <circle cx={C} cy={C} r={8} className="fill-zinc-900 dark:fill-white" />
          </svg>
        </div>
        <p className="text-center text-sm">
          <span className={`mr-1 rounded px-1.5 py-0.5 text-xs text-white ${GROUP[now.group].chip}`}>{GROUP[now.group].name}</span>
          第 {now.step} 關：<strong>{now.question}</strong>
        </p>
        <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <strong className="text-zinc-900 dark:text-zinc-100">動態投資思維羅盤</strong>
            由大到小轉一圈：先看世界（1–3 關：景氣、資金、季節），再挑產業（4–5 關），最後挑公司（6–8 關：贏家、價格、買賣）。
          </p>
          <p>「動態」的意思是：世界變了就從第 1 關重新轉一次。經濟是主人、股價是狗，先看主人往哪走。</p>
        </div>
        <button
          onClick={() => window.dispatchEvent(new Event("market-tour"))}
          className="w-full rounded-full bg-amber-400 py-2 text-sm font-medium text-zinc-900"
        >
          ▶ 第一次來？跟著導覽走一圈
        </button>
      </section>

      <nav data-tour="chips" className="sticky top-0 z-10 -mx-4 flex gap-1 overflow-x-auto bg-[var(--background)]/95 px-4 py-2 backdrop-blur">
        {steps.map((s) => (
          <button
            key={s.step}
            onClick={() => go(s.step)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
              s.step === cur ? `${GROUP[s.group].chip} text-white` : "bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            {s.step} {s.short}
          </button>
        ))}
      </nav>

      <div id="hub-panel" data-level={cur} key={cur} className="animate-rise scroll-mt-14">
        {panels[cur - 1]}
      </div>

      <div className="flex justify-between text-sm">
        {cur > 1 ? (
          <button onClick={() => go(cur - 1, true)} className="rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
            ← {steps[cur - 2].short}
          </button>
        ) : (
          <span />
        )}
        {cur < n && (
          <button onClick={() => go(cur + 1, true)} className={`rounded-full px-4 py-2 text-white ${GROUP[steps[cur].group].chip}`}>
            下一關：{steps[cur].short} →
          </button>
        )}
      </div>
    </div>
  );
}
