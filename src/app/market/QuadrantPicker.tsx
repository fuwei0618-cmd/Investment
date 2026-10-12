"use client";

import { PHASES } from "@/lib/macro";
import { usePersistentState } from "@/lib/storage";
import { GROWTH_AVG, INFLATION_AVG } from "@/lib/compass";

// 四象限：上排經濟成長高於平均、右欄物價高於平均以外的組合，照羅盤圖排列。
const GRID = [
  { key: "slowdown", hint: "成長↓ 物價↑" },
  { key: "expansion", hint: "成長↑ 物價↑" },
  { key: "recession", hint: "成長↓ 物價↓" },
  { key: "recovery", hint: "成長↑ 物價↓" },
] as const;

export default function QuadrantPicker({
  auto,
  growth,
  inflation,
}: {
  auto: string | null;
  growth: number | null;
  inflation: number | null;
}) {
  const [phase, setPhase] = usePersistentState<string>("macro.phase.v1", auto ?? "expansion");
  const chosen = PHASES.find((p) => p.key === phase) ?? PHASES[0];
  return (
    <div className="space-y-3">
      {auto && growth !== null && inflation !== null && (
        <p className="text-sm">
          用目前數字粗估：美國經濟成長 {growth.toFixed(1)}%（平均約 {GROWTH_AVG}%）、物價年增 {inflation.toFixed(1)}%（平均約{" "}
          {INFLATION_AVG}%），落在<strong className="mx-1">{PHASES.find((p) => p.key === auto)?.name}</strong>
          。這只是粗估，也可以看上面兩關的數字自己判斷，點下面的格子選定。
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {GRID.map((g) => {
          const p = PHASES.find((x) => x.key === g.key)!;
          const active = phase === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setPhase(g.key)}
              className={`rounded-md border p-3 text-left text-sm ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <span className="font-medium">{p.name}</span>
              {auto === g.key && <span className="ml-1 text-xs opacity-70">（粗估）</span>}
              <span className="block text-xs opacity-70">{g.hint}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm">
        你選的是<strong className="mx-1">{chosen.name}</strong>：股票{chosen.stock}；債券{chosen.bond}；原物料{chosen.commodity}。
      </p>
    </div>
  );
}
