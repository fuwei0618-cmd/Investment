"use client";

import { useEffect, useState } from "react";
import LineChart from "@/components/LineChart";
import LightDot from "@/components/Light";
import type { Observation } from "@/lib/macro";
import { TILES, changeOver } from "@/lib/live";

// 數字從 0 跑到現在的值，讓人一眼看出「這是剛抓來的」。
function useCountUp(target: number, ms = 700) {
  const [v, setV] = useState(target);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Mini({ s }: { s: Observation[] }) {
  const last = s.slice(-52);
  if (last.length < 2) return null;
  const vals = last.map((o) => o.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const d = last
    .map((o, i) => `${i ? "L" : "M"}${((i / (last.length - 1)) * 100).toFixed(1)},${(28 - ((o.value - min) / (max - min || 1)) * 26).toFixed(1)}`)
    .join("");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-7 w-full">
      <path
        d={d}
        fill="none"
        strokeWidth={1.5}
        pathLength={1}
        vectorEffect="non-scaling-stroke"
        className="animate-draw stroke-blue-500"
      />
    </svg>
  );
}

function Card({
  id,
  series,
  active,
  onClick,
  delay,
}: {
  id: string;
  series: Observation[];
  active: boolean;
  onClick: () => void;
  delay: number;
}) {
  const t = TILES.find((x) => x.id === id)!;
  const last = series.at(-1)!;
  const v = useCountUp(last.value);
  const ch = changeOver(series, 91);
  const up = (ch ?? 0) >= 0;
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`animate-rise rounded-lg border p-3 text-left transition ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white shadow-lg dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      <span className="flex items-center gap-1.5 text-xs opacity-80">
        <LightDot light={t.judge(last.value)} />
        {t.name}
        {t.role && <span className="rounded bg-amber-400 px-1 text-[10px] text-zinc-900">{t.role}</span>}
      </span>
      <span className="mt-1 block text-xl font-semibold tabular-nums">
        {v.toLocaleString("zh-TW", { maximumFractionDigits: t.digits, minimumFractionDigits: t.digits })}
        <span className="ml-0.5 text-xs font-normal">{t.unit}</span>
      </span>
      {ch !== null && (
        <span className="text-xs tabular-nums opacity-70">
          {up ? "▲" : "▼"} {Math.abs(ch).toFixed(t.digits)}
          <span className="ml-1">近 3 個月</span>
        </span>
      )}
      <Mini s={series} />
    </button>
  );
}

// 一關的數字卡：點一張，下面的大圖就換成那個數字。
export default function LiveBoard({
  ids,
  data,
  overlayId,
}: {
  ids: string[];
  data: Record<string, Observation[] | null>;
  overlayId?: string; // 例如股價卡可以疊上「主人」就業
}) {
  const ready = ids.filter((id) => (data[id]?.length ?? 0) > 1);
  const [sel, setSel] = useState(ready[0]);
  const [withOwner, setWithOwner] = useState(true);
  if (!ready.length) return <p className="text-sm text-zinc-500">今天的數字暫時抓不到，可以先看下面的說明。</p>;
  const t = TILES.find((x) => x.id === sel)!;
  const ov = overlayId && sel === "SP500" && withOwner ? data[overlayId] : null;
  const ot = overlayId ? TILES.find((x) => x.id === overlayId) : undefined;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ready.map((id, i) => (
          <Card key={id} id={id} series={data[id]!} active={id === sel} onClick={() => setSel(id)} delay={i * 60} />
        ))}
      </div>
      <div key={sel} className="animate-rise space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium">{t.name}</p>
          {overlayId && sel === "SP500" && (
            <label className="flex shrink-0 items-center gap-1 text-xs">
              <input type="checkbox" checked={withOwner} onChange={(e) => setWithOwner(e.target.checked)} />
              疊上主人（{ot?.name}）
            </label>
          )}
        </div>
        <LineChart
          series={data[sel]!}
          label={t.name}
          unit={t.unit}
          digits={t.digits}
          lines={t.lines}
          overlay={ov && ot ? { series: ov, label: ot.name, unit: ot.unit, digits: ot.digits } : undefined}
        />
        <p className="text-sm">{t.how}</p>
        <p className="text-xs text-zinc-500">課程：{t.course}</p>
      </div>
    </div>
  );
}
