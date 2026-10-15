"use client";

import { useState } from "react";
import { GROUPS, RISK_WORD, TOOLS, type Tool, type ToolGroup } from "@/lib/tools";

const RISK_TONE = ["", "bg-emerald-500", "bg-lime-500", "bg-amber-500", "bg-orange-500", "bg-red-500"];

function Dots({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`風險 ${n} 分（滿分 5）`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${i <= n ? RISK_TONE[n] : "bg-zinc-200 dark:bg-zinc-700"}`} />
      ))}
    </span>
  );
}

function Card({ t, open, toggle }: { t: Tool; open: boolean; toggle: () => void }) {
  return (
    <li id={t.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <button onClick={toggle} className="flex w-full items-start gap-3 p-3 text-left" aria-expanded={open}>
        <span className="text-2xl leading-none">{t.icon}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="font-medium">{t.name}</span>
            <Dots n={t.risk} />
            <span className="text-xs text-zinc-500">{RISK_WORD[t.risk]}</span>
          </span>
          <span className="block text-sm text-zinc-600 dark:text-zinc-400">{t.what}</span>
        </span>
        <span className="text-zinc-400">{open ? "−" : "＋"}</span>
      </button>
      {open && (
        <dl className="animate-rise space-y-2 border-t border-zinc-100 p-3 text-sm dark:border-zinc-800">
          <div>
            <dt className="font-medium text-emerald-700 dark:text-emerald-400">💰 怎麼賺</dt>
            <dd>{t.earn}</dd>
          </div>
          <div>
            <dt className="font-medium text-red-700 dark:text-red-400">⚠️ 怎麼賠</dt>
            <dd>{t.lose}</dd>
          </div>
          {t.numbers && (
            <div>
              <dt className="font-medium">📊 數字</dt>
              <dd>{t.numbers}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium">📘 課程怎麼說</dt>
            <dd>{t.course}</dd>
          </div>
          <div className="rounded-md bg-sky-50 p-2 dark:bg-sky-950">
            <dt className="font-medium text-sky-800 dark:text-sky-200">🗣️ 客戶問：「{t.client.q}」</dt>
            <dd className="text-sky-900 dark:text-sky-100">你可以說：{t.client.a}</dd>
          </div>
          <p className="text-xs text-zinc-500">出處：{t.src}</p>
        </dl>
      )}
    </li>
  );
}

export default function ToolCards() {
  const [group, setGroup] = useState<ToolGroup | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const shown = group === "all" ? TOOLS : TOOLS.filter((t) => t.group === group);
  const pick = (id: string) => {
    setGroup("all");
    setOpen(id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <div className="space-y-4">
      <section className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">風險由低到高，一眼看完</h2>
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5].map((r) => (
            <div key={r} className="flex items-start gap-2">
              <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${RISK_TONE[r]}`} />
              <span className="w-16 shrink-0 text-sm text-zinc-500">{RISK_WORD[r]}</span>
              <span className="flex flex-wrap gap-1.5">
                {TOOLS.filter((t) => t.risk === r).map((t) => (
                  <button key={t.id} onClick={() => pick(t.id)} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                    {t.icon} {t.name}
                  </button>
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500">點一個名字直接看那張卡。</p>
      </section>

      <div className="flex flex-wrap gap-1.5">
        {[{ id: "all" as const, label: "全部", hint: "" }, ...GROUPS].map((g) => (
          <button
            key={g.id}
            onClick={() => setGroup(g.id)}
            className={`rounded-full px-3 py-1 text-sm ${group === g.id ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800"}`}
          >
            {g.label}
          </button>
        ))}
      </div>
      {group !== "all" && <p className="text-sm text-zinc-600 dark:text-zinc-400">{GROUPS.find((g) => g.id === group)?.hint}</p>}

      <ul className="grid gap-2 sm:grid-cols-2">
        {shown.map((t) => (
          <Card key={t.id} t={t} open={open === t.id} toggle={() => setOpen(open === t.id ? null : t.id)} />
        ))}
      </ul>
    </div>
  );
}
