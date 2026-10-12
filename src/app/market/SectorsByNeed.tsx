"use client";

import { PHASES } from "@/lib/macro";
import { usePersistentState } from "@/lib/storage";
import { PHASE_SECTORS, sectorFits } from "@/lib/compass";
import type { PhaseKey } from "@/lib/industry";
import { NEED_SECTORS } from "@/lib/compassData";
import { chainsOfSector } from "@/lib/chains";

function openChain(key: string) {
  try {
    localStorage.setItem("market.chain.v1", JSON.stringify(key));
  } catch {}
  window.location.hash = "level-5";
}

export default function SectorsByNeed() {
  const [phase] = usePersistentState<string>("macro.phase.v1", "expansion");
  const p = PHASES.find((x) => x.key === phase) ?? PHASES[0];
  const pick = PHASE_SECTORS[p.key as PhaseKey];
  const fits = (sector: string) => sectorFits(pick.sectors, sector);
  const sorted = [...NEED_SECTORS].sort((a, b) => Number(fits(b.sector)) - Number(fits(a.sector)));
  return (
    <div className="space-y-3">
      <p className="text-sm">
        你在第 3 關選的是<strong className="mx-1">{p.name}</strong>，羅盤建議：<strong>{pick.focus}</strong>。亮起來的是現在比較順風的產業。
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {sorted.map((s) => {
          const fit = fits(s.sector);
          return (
            <div
              key={s.sector}
              className={`rounded-md border p-3 text-sm ${
                fit
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                  : "border-zinc-200 opacity-70 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">
                  {s.need} → {s.sector}
                </span>
                <span className="text-xs text-zinc-500">{s.etf}</span>
              </div>
              <p className="text-xs text-zinc-500">{s.members}</p>
              <p className="mt-1">何時好：{s.cycle}</p>
              <p>看什麼：{s.watch}</p>
              {s.trend && <p className="text-zinc-600 dark:text-zinc-400">長期趨勢：{s.trend}</p>}
              {chainsOfSector(s.sector).map((c) => (
                <button key={c.key} onClick={() => openChain(c.key)} className="mt-1 block text-blue-600">
                  看產業鏈：{c.title} →
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
