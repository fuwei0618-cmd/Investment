"use client";

import { useEffect, useState } from "react";
import { PHASES } from "@/lib/macro";
import type { PhaseKey } from "@/lib/industry";
import { usePersistentState } from "@/lib/storage";
import { ClockPoint, clockPhase } from "@/lib/live";

const S = 300;
const C = S / 2;

// 四個角：右上擴張 → 左上趨緩 → 左下衰退 → 右下復甦，逆時針轉一圈就是一次景氣循環。
const CORNERS: { key: PhaseKey; x: number; y: number; anchor: "start" | "end"; fill: string }[] = [
  { key: "expansion", x: S - 8, y: 20, anchor: "end", fill: "fill-emerald-500/10" },
  { key: "slowdown", x: 8, y: 20, anchor: "start", fill: "fill-amber-400/10" },
  { key: "recession", x: 8, y: S - 10, anchor: "start", fill: "fill-red-500/10" },
  { key: "recovery", x: S - 8, y: S - 10, anchor: "end", fill: "fill-sky-500/10" },
];

const RECT: Record<PhaseKey, [number, number]> = {
  expansion: [C, 0],
  slowdown: [0, 0],
  recession: [0, C],
  recovery: [C, C],
};

const nameOf = (k: PhaseKey) => PHASES.find((p) => p.key === k)!.name;

export default function CycleClock({
  avg,
  trail,
  compassPhase,
}: {
  avg: number;
  trail: ClockPoint[];
  compassPhase: PhaseKey | null;
}) {
  const [n, setN] = useState(1);
  const [run, setRun] = useState(0);
  const clockNow = trail.length ? clockPhase(trail.at(-1)!, avg) : null;
  const [picked, setPicked] = usePersistentState<string>("macro.phase.v1", compassPhase ?? clockNow ?? "expansion");

  useEffect(() => {
    if (!trail.length) return;
    let i = 1;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= trail.length) clearInterval(id);
    }, 140);
    return () => clearInterval(id);
  }, [trail.length, run]);

  if (trail.length < 2 || !clockNow) return <p className="text-sm text-zinc-500">景氣時鐘的數字暫時抓不到。</p>;

  const mx = Math.max(...trail.map((p) => Math.abs(p.accel)), 0.5) * 1.2;
  const my = Math.max(...trail.map((p) => Math.abs(p.level - avg)), 0.5) * 1.2;
  const px = (p: ClockPoint) => C + (p.accel / mx) * (C - 16);
  const py = (p: ClockPoint) => C - ((p.level - avg) / my) * (C - 16);
  const shown = trail.slice(0, n);
  const head = shown.at(-1)!;
  const headPhase = clockPhase(head, avg);
  const chosen = PHASES.find((p) => p.key === picked) ?? PHASES[0];
  const agree = compassPhase === clockNow;

  return (
    <div className="space-y-3">
      <div data-tour="clock" className="relative mx-auto max-w-sm">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full select-none">
          {CORNERS.map((c) => (
            <g key={c.key} onClick={() => setPicked(c.key)} className="cursor-pointer">
              <rect
                x={RECT[c.key][0]}
                y={RECT[c.key][1]}
                width={C}
                height={C}
                className={`${c.fill} ${picked === c.key ? "stroke-zinc-900 dark:stroke-zinc-100" : "stroke-transparent"}`}
                strokeWidth={2}
              />
              <text x={c.x} y={c.y} textAnchor={c.anchor} className="fill-zinc-600 text-[13px] font-semibold dark:fill-zinc-300">
                {nameOf(c.key)}
              </text>
            </g>
          ))}
          <line x1={0} x2={S} y1={C} y2={C} className="stroke-zinc-300 dark:stroke-zinc-700" />
          <line x1={C} x2={C} y1={0} y2={S} className="stroke-zinc-300 dark:stroke-zinc-700" />
          <text x={S - 6} y={C - 5} textAnchor="end" className="fill-zinc-400 text-[10px]">
            加速 →
          </text>
          <text x={6} y={C - 5} className="fill-zinc-400 text-[10px]">
            ← 減速
          </text>
          <text x={C + 5} y={S / 2 - C + 34} className="fill-zinc-400 text-[10px]">
            ↑ 成長比平均快
          </text>
          <text x={C + 5} y={S - 24} className="fill-zinc-400 text-[10px]">
            ↓ 比平均慢
          </text>
          <polyline
            points={shown.map((p) => `${px(p).toFixed(1)},${py(p).toFixed(1)}`).join(" ")}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            className="stroke-blue-500/60"
          />
          {shown.map((p, i) => (
            <circle key={p.date} cx={px(p)} cy={py(p)} r={1.5 + (i / shown.length) * 2.5} className="fill-blue-500/70" />
          ))}
          <circle cx={px(head)} cy={py(head)} r={12} className="fill-blue-500/20">
            <animate attributeName="r" values="8;16;8" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={px(head)} cy={py(head)} r={6} className="fill-blue-600 stroke-white" strokeWidth={2} />
        </svg>
      </div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <p>
          <span className="tabular-nums text-zinc-500">{head.date.slice(0, 7)}</span>
          <strong className="ml-2">{nameOf(headPhase)}</strong>
          <span className="ml-1 text-xs text-zinc-500">（工廠生產年增 {head.level.toFixed(1)}%）</span>
        </p>
        <button
          onClick={() => {
            setN(1);
            setRun((r) => r + 1);
          }}
          className="shrink-0 rounded-full bg-zinc-900 px-3 py-1 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          ▶ 重播 2 年
        </button>
      </div>
      <p className="text-sm">
        藍點是過去 2 年景氣走過的路，會動的大點是現在。景氣像時鐘一樣逆時針轉：復甦 → 擴張 → 趨緩 → 衰退，再回到復甦。
      </p>
      {compassPhase && (
        <div data-tour="rulers" className={`rounded-md p-3 text-sm ${agree ? "bg-emerald-50 dark:bg-emerald-950" : "bg-amber-50 dark:bg-amber-950"}`}>
          <p className="font-medium">兩把尺</p>
          <p>
            看「成長＋物價」（羅盤）：<strong>{nameOf(compassPhase)}</strong>；看「成長＋加速度」（時鐘）：
            <strong>{nameOf(clockNow)}</strong>。
          </p>
          <p>{agree ? "兩把尺說的一樣，判斷比較有把握。" : "兩把尺不一樣，常常代表正在換季，動作放慢、分批調整。"}</p>
        </div>
      )}
      <div className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
        <p className="mb-1 text-xs text-zinc-500">點上面的格子換季節看看。「{chosen.name}」這一季，錢放哪裡：</p>
        <dl className="grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-1">
          <dt className="text-zinc-500">股票</dt>
          <dd>{chosen.stock}</dd>
          <dt className="text-zinc-500">債券</dt>
          <dd>{chosen.bond}</dd>
          <dt className="text-zinc-500">貨幣</dt>
          <dd>{chosen.fx}</dd>
          <dt className="text-zinc-500">原物料</dt>
          <dd>{chosen.commodity}</dd>
          <dt className="text-zinc-500">產業</dt>
          <dd>{chosen.sector}</dd>
        </dl>
        <p className="mt-2 text-xs text-zinc-500">課程：總經 2-1、2-2；你選的季節會帶到第 4 關的順風產業。</p>
      </div>
    </div>
  );
}
