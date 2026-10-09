import { Observation } from "@/lib/macro";

export default function Sparkline({ series }: { series: Observation[] }) {
  const W = 300;
  const H = 50;
  const vals = series.map((o) => o.value);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const d = series
    .map((o, i) => `${i ? "L" : "M"}${((i / Math.max(1, series.length - 1)) * W).toFixed(1)},${(H - ((o.value - min) / range) * H).toFixed(1)}`)
    .join("");
  const zero = H - ((0 - min) / range) * H;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="my-2 h-12 w-full" preserveAspectRatio="none">
      {min < 0 && <line x1={0} x2={W} y1={zero} y2={zero} className="stroke-zinc-300 dark:stroke-zinc-700" strokeDasharray="3 3" />}
      <path d={d} fill="none" strokeWidth={1.5} className="stroke-blue-600" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
