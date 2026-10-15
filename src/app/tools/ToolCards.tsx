"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RISK_WORD, TOOLS, type Tool } from "@/lib/tools";
import { SIX } from "@/lib/six";
import { HOUSE, ROLES, type Role } from "@/lib/street";
import { LEVELS, PLAYS } from "@/lib/plays";
import RiskStreet from "./RiskStreet";

const IN_SIX = new Set(SIX.map((w) => w.toolId));

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

const box = "rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-900";
const PLAY_BG = {
  1: "bg-emerald-50 dark:bg-emerald-950/50",
  2: "bg-amber-50 dark:bg-amber-950/50",
  3: "bg-red-50 dark:bg-red-950/50",
} as const;

function Card({ t, open, toggle }: { t: Tool; open: boolean; toggle: () => void }) {
  return (
    <li id={t.id} className={`scroll-mt-20 rounded-lg border border-zinc-200 dark:border-zinc-800 ${open ? "sm:col-span-2" : ""}`}>
      <button onClick={toggle} className="flex w-full items-start gap-3 p-3 text-left" aria-expanded={open}>
        <span className="text-2xl leading-none">{t.icon}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="font-medium">{t.name}</span>
            <Dots n={t.risk} />
            <span className="text-xs text-zinc-500">{RISK_WORD[t.risk]}</span>
          </span>
          <span className="block text-sm text-zinc-600 dark:text-zinc-400">{open ? `🥐 在麵包鎮：${t.town}` : t.what}</span>
        </span>
        <span className="text-zinc-400">{open ? "✕" : "＋"}</span>
      </button>
      {open && (
        <div className="animate-rise space-y-3 border-t border-zinc-100 p-3 text-sm dark:border-zinc-800">
          <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div className={box}>
              <dt className="font-medium">🔍 是什麼</dt>
              <dd>{t.what}</dd>
            </div>
            <div className={box}>
              <dt className="font-medium text-emerald-700 dark:text-emerald-400">💰 怎麼賺</dt>
              <dd>{t.earn}</dd>
            </div>
            <div className={box}>
              <dt className="font-medium text-red-700 dark:text-red-400">⚠️ 怎麼賠</dt>
              <dd>{t.lose}</dd>
            </div>
            {t.numbers && (
              <div className={box}>
                <dt className="font-medium">📊 數字</dt>
                <dd>{t.numbers}</dd>
              </div>
            )}
            <div className={box}>
              <dt className="font-medium">📘 課程怎麼說</dt>
              <dd>{t.course}</dd>
            </div>
            <div className="rounded-lg bg-sky-50 p-2.5 dark:bg-sky-950">
              <dt className="font-medium text-sky-800 dark:text-sky-200">🗣️ 客戶問：「{t.client.q}」</dt>
              <dd className="text-sky-900 dark:text-sky-100">你可以說：{t.client.a}</dd>
            </div>
          </dl>
          {PLAYS[t.id] && (
            <div>
              <h3 className="mb-1.5 font-semibold">💡 賺錢撇步：同一種工具，三種玩法</h3>
              <ol className="grid gap-2 md:grid-cols-3">
                {PLAYS[t.id].map((p) => (
                  <li key={p.level} className={`rounded-lg p-2.5 ${PLAY_BG[p.level]}`}>
                    <b className="block">{LEVELS[p.level].name}</b>
                    <span className="block">{p.how}</span>
                    {p.risk !== "—" && <span className="mt-1 block text-xs text-zinc-600 dark:text-zinc-400">{p.risk}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <p className="text-xs text-zinc-500">
            {IN_SIX.has(t.id) ? (
              <Link href="/tools/seasons" className="text-blue-600">
                🥐 看它在四季總表 →
              </Link>
            ) : (
              <a href="/game/bakery.html" className="text-blue-600">
                🎲 去麵包店大富翁玩一圈 →
              </a>
            )}
            <span className="ml-2">出處：{t.src}；賺錢撇步是一般常識整理，不是投資建議。</span>
          </p>
        </div>
      )}
    </li>
  );
}

// 卡片照風險大街的順序：先由穩到險，同一區再照錢從哪來
const ORDER = [...TOOLS].sort((a, b) => a.risk - b.risk || ROLES.findIndex((r) => r.id === HOUSE[a.id].role) - ROLES.findIndex((r) => r.id === HOUSE[b.id].role));

export default function ToolCards() {
  const [role, setRole] = useState<Role | "all">("all");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const scrollTo = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  // 點房子：打開或收起那張卡，可以一次開好幾張比較
  const pick = (id: string) => {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else {
      next.add(id);
      setRole("all");
      scrollTo(id);
    }
    setOpen(next);
  };
  const zoneIds = (r: number) => TOOLS.filter((t) => t.risk === r).map((t) => t.id);
  const zoneOpen = (r: number) => zoneIds(r).every((id) => open.has(id));
  const toggleZone = (r: number) => {
    const next = new Set(open);
    const ids = zoneIds(r);
    if (zoneOpen(r)) ids.forEach((id) => next.delete(id));
    else {
      ids.forEach((id) => next.add(id));
      setRole("all");
      scrollTo(ids[0]);
    }
    setOpen(next);
  };
  // 從遊戲或四季總表點進來（/tools#bond）時，直接打開那張卡
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!TOOLS.some((t) => t.id === id)) return;
    const raf = requestAnimationFrame(() => {
      setOpen(new Set([id]));
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  const shown = ORDER.filter((t) => role === "all" || HOUSE[t.id].role === role);

  return (
    <div className="space-y-4">
      <RiskStreet
        six={IN_SIX}
        selected={open}
        onPick={pick}
        zoneOpen={zoneOpen}
        onZone={toggleZone}
        onAll={(on) => setOpen(on ? new Set(TOOLS.map((t) => t.id)) : new Set())}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm text-zinc-500">錢從哪裡來：</span>
        {[{ id: "all" as const, name: "全部", line: "" }, ...ROLES].map((g) => (
          <button
            key={g.id}
            onClick={() => setRole(g.id)}
            className={`rounded-full px-3 py-1 text-sm ${role === g.id ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800"}`}
          >
            {g.name}
          </button>
        ))}
      </div>
      {role !== "all" && <p className="text-sm text-zinc-600 dark:text-zinc-400">{ROLES.find((g) => g.id === role)?.line}</p>}

      <ul className="grid gap-2 sm:grid-cols-2">
        {shown.map((t) => (
          <Card key={t.id} t={t} open={open.has(t.id)} toggle={() => pick(t.id)} />
        ))}
      </ul>
    </div>
  );
}
