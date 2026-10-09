"use client";

import Link from "next/link";
import Sparkline from "@/components/Sparkline";
import { PHASES, Observation } from "@/lib/macro";
import { SECTORS } from "@/lib/industry";
import { usePersistentState } from "@/lib/storage";

export interface SignalView {
  value: number;
  date: string;
  favorable: boolean;
  text: string;
  series: Observation[];
}

export default function SectorBoard({ signals }: { signals: Record<string, SignalView | null> }) {
  const [phaseKey] = usePersistentState<string>("macro.phase.v1", "expansion");
  const phase = PHASES.find((p) => p.key === phaseKey) ?? PHASES[0];
  const sorted = [...SECTORS].sort(
    (a, b) => Number(b.phases.includes(phase.key)) - Number(a.phases.includes(phase.key)),
  );

  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        目前象限：<strong>{phase.name}</strong>（在
        <Link href="/macro" className="mx-1 text-blue-600">
          總經羅盤
        </Link>
        切換）。M平方 建議產業：{phase.sector}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((s) => {
          const fit = s.phases.includes(phase.key);
          const sig = signals[s.key];
          return (
            <div
              key={s.key}
              className={`rounded-lg border bg-white p-4 dark:bg-zinc-900 ${
                fit ? "border-blue-500" : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium">{s.name}</h3>
                <span className="text-xs text-zinc-500">{s.members}</span>
                {fit && <span className="ml-auto rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white">適合此象限</span>}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {s.traits}・適合：{s.timing}・ETF：{s.etf}
              </p>

              <div className="mt-3 rounded-md bg-zinc-50 p-2 dark:bg-zinc-800">
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="text-zinc-500">{s.auto.label}</span>
                  {sig && (
                    <span className={`ml-auto ${sig.favorable ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
                      {sig.text}
                    </span>
                  )}
                </div>
                {sig ? (
                  <>
                    <div className="text-lg font-semibold tabular-nums">
                      {sig.value.toFixed(2)}
                      <span className="ml-1 text-xs font-normal text-zinc-500">{s.auto.unit}</span>
                    </div>
                    <Sparkline series={sig.series} />
                    <p className="text-xs text-zinc-500">資料日 {sig.date}・FRED {s.auto.id}</p>
                  </>
                ) : (
                  <p className="text-sm text-zinc-500">暫時取不到資料</p>
                )}
              </div>

              <ul className="mt-3 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
                {s.indicators.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
