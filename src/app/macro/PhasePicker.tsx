"use client";

import { PHASES } from "@/lib/macro";
import { usePersistentState } from "@/lib/storage";

export default function PhasePicker() {
  const [phase, setPhase] = usePersistentState<string>("macro.phase.v1", "expansion");
  const p = PHASES.find((x) => x.key === phase) ?? PHASES[0];
  const rows: [string, string][] = [
    ["殖利率曲線", p.yieldCurve],
    ["股票", p.stock],
    ["債券", p.bond],
    ["匯率", p.fx],
    ["原物料", p.commodity],
    ["產業", p.sector],
  ];
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-3 text-sm text-zinc-500">依上方指標判斷你認為目前所在的象限：</p>
      <div className="mb-4 grid grid-cols-4 gap-2">
        {PHASES.map((x, i) => (
          <button
            key={x.key}
            onClick={() => setPhase(x.key)}
            className={`rounded-md border px-2 py-2 text-sm ${
              x.key === phase
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {i + 1}. {x.name}
          </button>
        ))}
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-[6rem_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-zinc-500">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
