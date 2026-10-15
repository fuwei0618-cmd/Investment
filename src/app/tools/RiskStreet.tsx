"use client";

import { useState } from "react";
import { RISK_WORD, TOOLS, type Tool } from "@/lib/tools";
import { HOUSE, ROLES, ZONES, type Role } from "@/lib/street";

// 每一區的底色和字色：越右越危險
const ZONE_BG = ["bg-emerald-50 dark:bg-emerald-950/40", "bg-lime-50 dark:bg-lime-950/40", "bg-amber-50 dark:bg-amber-950/40", "bg-orange-50 dark:bg-orange-950/40", "bg-red-50 dark:bg-red-950/40"];
const ZONE_INK = ["text-emerald-700 dark:text-emerald-400", "text-lime-700 dark:text-lime-400", "text-amber-700 dark:text-amber-400", "text-orange-700 dark:text-orange-400", "text-red-700 dark:text-red-400"];

function House({ t, six, dim, on, onPick }: { t: Tool; six: boolean; dim: boolean; on: boolean; onPick: (id: string) => void }) {
  return (
    <button
      onClick={() => onPick(t.id)}
      aria-pressed={on}
      className={`flex items-center gap-1.5 rounded-xl border bg-white px-2 py-1 text-left shadow-sm transition hover:border-amber-400 dark:bg-zinc-900 ${on ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-white dark:ring-white" : "border-zinc-200 dark:border-zinc-700"} ${dim ? "opacity-30" : ""}`}
    >
      <span className="text-lg leading-none">{t.icon}</span>
      <span className="leading-tight">
        <span className="block whitespace-nowrap text-[13px] font-semibold">
          {t.name}
          {six && <span className="ml-0.5 text-[10px]">⭐</span>}
        </span>
        <span className="block whitespace-nowrap text-[11px] text-zinc-500">{HOUSE[t.id].nick}</span>
      </span>
    </button>
  );
}

export default function RiskStreet({
  six,
  selected,
  onPick,
  zoneOpen,
  onZone,
  rowOpen,
  onRow,
  onAll,
}: {
  six: Set<string>;
  selected: Set<string>;
  onPick: (id: string) => void;
  zoneOpen: (risk: number) => boolean;
  onZone: (risk: number) => void;
  rowOpen: (role: Role) => boolean;
  onRow: (role: Role) => void;
  onAll: (open: boolean) => void;
}) {
  const [onlySix, setOnlySix] = useState(false);
  const at = (risk: number, role?: string) => TOOLS.filter((t) => t.risk === risk && (!role || HOUSE[t.id].role === role));
  const house = (t: Tool) => <House key={t.id} t={t} six={six.has(t.id)} dim={onlySix && !six.has(t.id)} on={selected.has(t.id)} onPick={onPick} />;

  return (
    <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">🥐 麵包鎮風險大街</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">十八種工具都是鎮上的一間房子。先問錢從哪來，再看會跳多大：往右走越危險。點房子打開那張卡，可以一次點好幾間比較；點區名或左邊的錢，一次開一整排。</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => onAll(true)} className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold dark:bg-zinc-800">
            全部展開
          </button>
          <button onClick={() => onAll(false)} className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold dark:bg-zinc-800">
            全部收合
          </button>
          <button
            onClick={() => setOnlySix(!onlySix)}
            aria-pressed={onlySix}
            className={`rounded-full border-2 px-3 py-1 text-sm font-semibold ${onlySix ? "border-amber-400 bg-amber-50 dark:bg-amber-950" : "border-transparent bg-zinc-100 dark:bg-zinc-800"}`}
          >
            ⭐ 只看常見 6 種
          </button>
        </div>
      </div>

      {/* 電腦：五區 × 五種錢 */}
      <div className="hidden gap-1.5 md:grid md:grid-cols-[112px_repeat(5,minmax(0,1fr))]">
        <div className="self-end px-1 pb-1 leading-tight">
          <b className="block text-sm">錢從哪裡來</b>
          <span className="block text-[11px] text-zinc-500">專有名詞：資產類別</span>
          <span className="block text-[11px] text-zinc-500">往右：波動越大 →</span>
        </div>
        {ZONES.map((z, i) => (
          <button key={z} onClick={() => onZone(i + 1)} className={`rounded-lg px-2 py-1.5 text-left ${ZONE_BG[i]}`}>
            <b className={ZONE_INK[i]}>{z}</b> <span className="text-xs text-zinc-500">{RISK_WORD[i + 1]}</span>
            <span className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{zoneOpen(i + 1) ? "收合這區 ↑" : "展開這區 ↓"}</span>
          </button>
        ))}
        {ROLES.map((ro) => (
          <div key={ro.id} className="contents">
            <button onClick={() => onRow(ro.id)} className="rounded-lg bg-zinc-100 px-2 py-1.5 text-left dark:bg-zinc-800">
              <b className="block text-sm">{ro.name}</b>
              <span className="block text-[11px] font-semibold text-amber-700 dark:text-amber-400">{ro.term}</span>
              <span className="block text-[11px] leading-snug text-zinc-500">{ro.line}</span>
              <span className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{rowOpen(ro.id) ? "收合這排 ←" : "展開這排 →"}</span>
            </button>
            {ZONES.map((z, i) => (
              <div key={z} className={`flex flex-wrap content-start gap-1.5 rounded-lg p-1.5 ${ZONE_BG[i]}`}>
                {at(i + 1, ro.id).map(house)}
              </div>
            ))}
          </div>
        ))}
        <div />
        <div className="col-span-5 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" />
      </div>

      {/* 手機：五區由上往下 */}
      <div className="space-y-2 md:hidden">
        {ZONES.map((z, i) => (
          <div key={z} className={`rounded-lg p-2 ${ZONE_BG[i]}`}>
            <button onClick={() => onZone(i + 1)} className="mb-1.5 flex w-full items-baseline gap-2 text-left">
              <b className={ZONE_INK[i]}>{z}</b>
              <span className="text-xs text-zinc-500">{RISK_WORD[i + 1]}</span>
              <span className="ml-auto text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{zoneOpen(i + 1) ? "收合這區 ↑" : "展開這區 ↓"}</span>
            </button>
            <div className="flex flex-wrap gap-1.5">{at(i + 1).map(house)}</div>
          </div>
        ))}
        <div className="space-y-1 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
          <p className="text-xs text-zinc-500">錢從哪裡來（資產類別），點一下開一整排：</p>
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => (
              <button key={r.id} onClick={() => onRow(r.id)} aria-pressed={rowOpen(r.id)} className={`rounded-full px-2.5 py-0.5 text-xs ${rowOpen(r.id) ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-white dark:bg-zinc-900"}`}>
                {r.name}・{r.term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
