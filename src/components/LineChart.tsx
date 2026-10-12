"use client";

import { useMemo, useState } from "react";
import type { Observation } from "@/lib/macro";

const RANGES = [
  { key: "1Y", label: "1 年", days: 365 },
  { key: "3Y", label: "3 年", days: 3 * 365 },
  { key: "10Y", label: "10 年", days: 3650 },
] as const;

const W = 400;
const H = 210;
const PAD = { l: 8, r: 8, t: 12, b: 18 };

function cut(s: Observation[], days: number) {
  const last = s.at(-1);
  if (!last) return s;
  const from = new Date(new Date(last.date).getTime() - days * 86_400_000).toISOString().slice(0, 10);
  return s.filter((o) => o.date >= from);
}

function scale(vals: number[]) {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = (max - min) * 0.08 || 1;
  return { min: min - pad, max: max + pad };
}

// 互動折線圖：可切 1/3/10 年、手指或滑鼠移動看每個點，可疊第二條線（例如「主人」就業）。
export default function LineChart({
  series,
  label,
  unit,
  digits = 1,
  lines = [],
  overlay,
}: {
  series: Observation[];
  label: string;
  unit: string;
  digits?: number;
  lines?: { value: number; label: string }[];
  overlay?: { series: Observation[]; label: string; unit: string; digits?: number };
}) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("3Y");
  const [hover, setHover] = useState<number | null>(null);
  const days = RANGES.find((r) => r.key === range)!.days;

  const data = useMemo(() => cut(series, days), [series, days]);
  const over = useMemo(() => (overlay ? cut(overlay.series, days) : []), [overlay, days]);
  if (data.length < 2) return <p className="text-sm text-zinc-500">資料不足，暫時畫不出來。</p>;

  const t0 = new Date(data[0].date).getTime();
  const t1 = new Date(data.at(-1)!.date).getTime();
  const x = (d: string) => PAD.l + ((new Date(d).getTime() - t0) / (t1 - t0 || 1)) * (W - PAD.l - PAD.r);
  const sy = scale([...data.map((o) => o.value), ...lines.map((l) => l.value)]);
  const y = (v: number) => PAD.t + (1 - (v - sy.min) / (sy.max - sy.min)) * (H - PAD.t - PAD.b);
  const path = data.map((o, i) => `${i ? "L" : "M"}${x(o.date).toFixed(1)},${y(o.value).toFixed(1)}`).join("");
  const area = `${path}L${x(data.at(-1)!.date).toFixed(1)},${H - PAD.b}L${x(data[0].date).toFixed(1)},${H - PAD.b}Z`;

  const so = over.length ? scale(over.map((o) => o.value)) : null;
  const oy = (v: number) => PAD.t + (1 - (v - so!.min) / (so!.max - so!.min)) * (H - PAD.t - PAD.b);
  const overPath = so
    ? over
        .filter((o) => o.date >= data[0].date)
        .map((o, i) => `${i ? "L" : "M"}${x(o.date).toFixed(1)},${oy(o.value).toFixed(1)}`)
        .join("")
    : "";

  const h = hover !== null ? data[Math.min(hover, data.length - 1)] : null;
  const hOver = h && over.length ? [...over].reverse().find((o) => o.date <= h.date) : null;

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const t = t0 + ((px - PAD.l) / (W - PAD.l - PAD.r)) * (t1 - t0);
    let best = 0;
    for (let i = 0; i < data.length; i++)
      if (Math.abs(new Date(data[i].date).getTime() - t) < Math.abs(new Date(data[best].date).getTime() - t)) best = i;
    setHover(best);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 text-xs">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 ${
                range === r.key ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
          {h ? (
            <>
              {h.date}：<strong>{h.value.toFixed(digits)}</strong>
              {unit}
              {hOver && overlay && (
                <span className="ml-1 text-amber-600">
                  {overlay.label} {hOver.value.toFixed(overlay.digits ?? 1)}
                  {overlay.unit}
                </span>
              )}
            </>
          ) : (
            "手指滑過圖看每一天"
          )}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-pan-y select-none"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines.map((l) => (
          <g key={l.label}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(l.value)} y2={y(l.value)} className="stroke-red-400" strokeDasharray="4 4" />
            <text x={W - PAD.r} y={y(l.value) - 3} textAnchor="end" className="fill-red-500 text-[11px]">
              {l.label}
            </text>
          </g>
        ))}
        <path key={`a${range}`} d={area} fill="url(#fill)" className="animate-rise" />
        {overPath && (
          <path
            key={`o${range}`}
            d={overPath}
            fill="none"
            strokeWidth={2}
            pathLength={1}
            className="animate-draw stroke-amber-500"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <path
          key={`p${range}`}
          d={path}
          fill="none"
          strokeWidth={2}
          pathLength={1}
          className="animate-draw stroke-blue-600"
          vectorEffect="non-scaling-stroke"
        />
        {h && (
          <g>
            <line x1={x(h.date)} x2={x(h.date)} y1={PAD.t} y2={H - PAD.b} className="stroke-zinc-400" />
            <circle cx={x(h.date)} cy={y(h.value)} r={5} className="fill-zinc-900 dark:fill-white" />
          </g>
        )}
        <text x={PAD.l} y={H - 4} className="fill-zinc-400 text-[11px]">
          {data[0].date.slice(0, 7)}
        </text>
        <text x={W - PAD.r} y={H - 4} textAnchor="end" className="fill-zinc-400 text-[11px]">
          {data.at(-1)!.date.slice(0, 7)}
        </text>
      </svg>
      {overlay && (
        <p className="flex gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-blue-600" />
            {label}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-amber-500" />
            {overlay.label}
          </span>
        </p>
      )}
    </div>
  );
}
