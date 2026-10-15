"use client";

import { useCallback, useEffect, useState } from "react";
import { SEASONS, SIX, isSeason, type Season } from "@/lib/six";
import { YEARS } from "@/lib/sixYear";
import YearModal from "./YearModal";

const cell = "border-b border-zinc-200 px-2 py-2 text-center dark:border-zinc-800";
const rowHead = "border-b border-zinc-200 px-3 py-2 text-left text-xs font-semibold text-zinc-500 dark:border-zinc-800";

export default function SeasonTable() {
  const [cur, setCur] = useState<Season>("spring");
  const [open, setOpen] = useState<string | null>(null);
  const close = useCallback(() => setOpen(null), []);
  // 從遊戲進來時（/tools/seasons#autumn）亮起剛走過的那一季
  useEffect(() => {
    const h = location.hash.slice(1);
    if (!isSeason(h)) return;
    const raf = requestAnimationFrame(() => setCur(h));
    return () => cancelAnimationFrame(raf);
  }, []);
  const season = SEASONS.find((s) => s.id === cur)!;

  const way = SIX.find((w) => w.toolId === open);
  const year = YEARS.find((y) => y.toolId === open);

  return (
    <>
      {way && year && <YearModal key={way.toolId} way={way} year={year} onClose={close} />}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-36" />
            {SIX.map((w) => (
              <col key={w.toolId} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className={rowHead} />
              {SIX.map((w) => (
                <th key={w.toolId} className={`${cell} align-bottom`}>
                  <button onClick={() => setOpen(w.toolId)} className="group block w-full rounded-lg p-1 hover:bg-amber-50 dark:hover:bg-amber-950/40">
                    <span className="block text-2xl">{w.icon}</span>
                    <span className="block font-semibold group-hover:text-amber-700 dark:group-hover:text-amber-300">{w.name}</span>
                    <span className="block text-xs text-zinc-500">{w.tool}</span>
                    <span className="block text-[11px] font-semibold text-amber-600">▶ 看它的一年</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SEASONS.map((s) => {
              const on = s.id === cur;
              return (
                <tr key={s.id} className={on ? "bg-amber-50 dark:bg-amber-950/40" : ""}>
                  <th className={rowHead}>
                    <button onClick={() => setCur(s.id)} className="text-left" aria-pressed={on}>
                      <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.name}</span>
                      <span className="block">{s.desc}</span>
                    </button>
                  </th>
                  {SIX.map((w) => (
                    <td key={w.toolId} className={cell}>
                      <span className="block text-2xl leading-tight">{w.mood[s.id][0]}</span>
                      <span className="text-xs text-zinc-500">{w.mood[s.id][1]}</span>
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="border-t-4 border-double border-zinc-200 dark:border-zinc-700">
              <th className={rowHead}>
                {season.name}
                <br />
                為什麼
              </th>
              {SIX.map((w) => (
                <td key={w.toolId} className={`${cell} align-top text-left text-xs leading-relaxed`}>
                  {w.mood[cur][2]}
                </td>
              ))}
            </tr>
            {(
              [
                ["1 萬元的成本", "cost", ""],
                ["平常一年", "norm", "text-emerald-600 dark:text-emerald-400"],
                ["最慘一年", "worst", "text-red-600 dark:text-red-400"],
              ] as const
            ).map(([label, key, tone]) => (
              <tr key={key}>
                <th className={rowHead}>{label}</th>
                {SIX.map((w) => (
                  <td key={w.toolId} className={`${cell} font-semibold tabular-nums ${w.toolId === "deposit" && key === "worst" ? "" : tone}`}>
                    {w[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
