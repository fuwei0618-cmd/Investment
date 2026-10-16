"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RISK_WORD, TOOLS, type Tool } from "@/lib/tools";
import { SIX } from "@/lib/six";
import { HOUSE, ROLES, type Role } from "@/lib/street";
import { BY_TERM, LEVELS, PLAYS, TERMS } from "@/lib/plays";
import { FAST, STEPS } from "@/lib/fastPlay";
import RiskStreet from "./RiskStreet";

const IN_SIX = new Set(SIX.map((w) => w.toolId));

const RISK_TONE = ["", "bg-emerald-500", "bg-lime-500", "bg-amber-500", "bg-orange-500", "bg-red-500"];
const RISK_EDGE = ["", "border-l-emerald-500", "border-l-lime-500", "border-l-amber-500", "border-l-orange-500", "border-l-red-500"];

function Dots({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`風險 ${n} 分（滿分 5）`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${i <= n ? RISK_TONE[n] : "bg-stone-200 dark:bg-stone-700"}`} />
      ))}
    </span>
  );
}

// 麵包鎮的紙色：奶油底、米色小格
const paper = "bg-[#fffdf8] dark:bg-[#221d16]";
const chip = "rounded-xl bg-[#f3ead8] p-2.5 dark:bg-[#2f281f]";
const PLAY_BG = {
  1: "bg-emerald-50 dark:bg-emerald-950/50",
  2: "bg-amber-50 dark:bg-amber-950/50",
  3: "bg-red-50 dark:bg-red-950/50",
} as const;
const TERM_BG = {
  long: "bg-sky-50 dark:bg-sky-950/50",
  mid: "bg-violet-50 dark:bg-violet-950/50",
  short: "bg-rose-50 dark:bg-rose-950/50",
} as const;

type View = "info" | "risk" | "term";
const VIEWS: { id: View; name: string }[] = [
  { id: "info", name: "📖 認識它" },
  { id: "risk", name: "💡 撇步：照風險分" },
  { id: "term", name: "⏱️ 撇步：照放多久分" },
];

function Box({ label, ink = "", className = chip, children }: { label: string; ink?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`${className} min-w-0`}>
      <b className={`block text-xs ${ink}`}>{label}</b>
      {children}
    </div>
  );
}

function FastButton({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <button onClick={toggle} aria-expanded={on} className="mt-1.5 block rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold shadow-sm dark:bg-black/30">
      📋 {on ? "收起操作卡" : "詳細操作卡"}
    </button>
  );
}

// 衝一把／短線的操作小卡：六步照順序做
function FastCard({ id }: { id: string }) {
  const f = FAST[id];
  if (typeof f === "string")
    return <p className="animate-rise rounded-xl border-2 border-dashed border-stone-300 p-3 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">📋 不適合衝：{f}</p>;
  return (
    <div className="animate-rise rounded-xl border-2 border-red-200 bg-white p-3 text-sm dark:border-red-900 dark:bg-stone-900">
      <p className="mb-2 font-black">
        📋 衝一把／短線操作卡：{f.title}
      </p>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.key} className={s.key === "stop" ? "rounded-xl bg-red-50 p-2.5 dark:bg-red-950/50" : chip}>
            <b className="block text-xs">{s.name}</b>
            {f[s.key]}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-stone-500">先寫好第 ④ 步再按下單。比例和停損是常見的保守做法，可以照你的風險屬性再調小；一般常識整理，不是投資建議。</p>
    </div>
  );
}

function Card({ t, view, close }: { t: Tool; view: View; close: () => void }) {
  const [fast, setFast] = useState(false);
  const role = ROLES.find((r) => r.id === HOUSE[t.id].role)!;
  return (
    <li id={t.id} className={`animate-rise relative scroll-mt-20 grid gap-3 rounded-2xl border-l-[6px] p-3 shadow-[0_1px_2px_rgba(60,40,10,.06),0_6px_16px_rgba(60,40,10,.08)] md:grid-cols-[170px_minmax(0,1fr)] ${paper} ${RISK_EDGE[t.risk]}`}>
      {/* 左欄：名字、圖示、麵包鎮說法 */}
      <div className="flex gap-2.5 pr-8 md:block md:pr-0">
        <span className="text-4xl leading-none">{t.icon}</span>
        <div className="min-w-0 md:mt-1.5">
          <h3 className="text-lg font-black leading-tight">{t.name}</h3>
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-stone-500">
            <Dots n={t.risk} /> {RISK_WORD[t.risk]}・{role.term}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-stone-600 dark:text-stone-400">🥐 {t.town}</p>
          <p className="mt-1 text-xs">
            {IN_SIX.has(t.id) ? (
              <Link href="/tools/seasons" className="text-blue-600">
                看它的四季 →
              </Link>
            ) : (
              <a href="/game/bakery.html" className="text-blue-600">
                去大富翁玩一圈 →
              </a>
            )}
          </p>
        </div>
      </div>
      <button onClick={close} aria-label={`收合${t.name}`} className="absolute right-2 top-2 rounded-lg px-2 py-1 font-black text-stone-400 hover:text-stone-700">
        ✕
      </button>

      {/* 右欄：同一種看法的格子，每張卡對齊 */}
      {view === "info" && (
        <dl className="grid gap-2 text-sm sm:grid-cols-2 md:pr-6 lg:grid-cols-5 lg:text-[13px] lg:leading-snug">
          <Box label="💰 怎麼賺" ink="text-emerald-700 dark:text-emerald-400">{t.earn}</Box>
          <Box label="⚠️ 怎麼賠" ink="text-red-700 dark:text-red-400">{t.lose}</Box>
          <Box label="📊 數字">{t.numbers ?? <span className="text-stone-400">課程沒給數字</span>}</Box>
          <Box label="📘 課程怎麼說">{t.course}</Box>
          <Box label={`🗣️ 客戶問：「${t.client.q}」`} className={`${chip} border-l-4 border-l-amber-400`}>
            {t.client.a}
          </Box>
        </dl>
      )}
      {view !== "info" && (
        <div className="space-y-2 md:pr-6">
          <ol className="grid gap-2 text-sm md:grid-cols-3">
            {view === "risk" &&
              [...PLAYS[t.id]].reverse().map((p) => (
                <li key={p.level} className={`rounded-xl p-2.5 ${PLAY_BG[p.level]}`}>
                  <b className="block text-xs">{LEVELS[p.level].name}</b>
                  {p.how}
                  {p.risk !== "—" && <span className="mt-1 block text-xs text-stone-600 dark:text-stone-400">{p.risk}</span>}
                  {p.level === 3 && <FastButton on={fast} toggle={() => setFast(!fast)} />}
                </li>
              ))}
            {view === "term" &&
              [...TERMS].reverse().map((term) => {
                const p = BY_TERM[t.id][term.id];
                return (
                  <li key={term.id} className={`rounded-xl p-2.5 ${p.risk === "—" ? "bg-stone-100 text-stone-500 dark:bg-stone-800" : TERM_BG[term.id]}`}>
                    <b className="block text-xs">{term.name}</b>
                    {p.how}
                    {p.risk !== "—" && <span className="mt-1 block text-xs text-stone-600 dark:text-stone-400">{p.risk}</span>}
                    {term.id === "short" && <FastButton on={fast} toggle={() => setFast(!fast)} />}
                  </li>
                );
              })}
          </ol>
          {fast && <FastCard id={t.id} />}
        </div>
      )}
    </li>
  );
}

// 卡片照風險大街的順序：先由穩到險，同一區再照錢從哪來
const ORDER = [...TOOLS].sort((a, b) => a.risk - b.risk || ROLES.findIndex((r) => r.id === HOUSE[a.id].role) - ROLES.findIndex((r) => r.id === HOUSE[b.id].role));

export default function ToolCards() {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("info");
  // 點房子：打開或收起那張卡，不捲走畫面，才能一間一間繼續點
  const pick = (id: string) => {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpen(next);
  };
  // 一區（直的）或一種錢（橫的）一起開合
  const group = (ids: string[]) => ({
    on: ids.every((id) => open.has(id)),
    toggle: () => {
      const next = new Set(open);
      if (ids.every((id) => open.has(id))) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      setOpen(next);
    },
  });
  const zone = (r: number) => group(TOOLS.filter((t) => t.risk === r).map((t) => t.id));
  const row = (ro: Role) => group(TOOLS.filter((t) => HOUSE[t.id].role === ro).map((t) => t.id));
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
  const shown = ORDER.filter((t) => open.has(t.id));

  return (
    <div className="space-y-4">
      <RiskStreet
        six={IN_SIX}
        selected={open}
        onPick={pick}
        zoneOpen={(r) => zone(r).on}
        onZone={(r) => zone(r).toggle()}
        rowOpen={(ro) => row(ro).on}
        onRow={(ro) => row(ro).toggle()}
        onAll={(on) => setOpen(on ? new Set(TOOLS.map((t) => t.id)) : new Set())}
      />

      <section className="space-y-2 rounded-2xl bg-[#f4eee2] p-2.5 dark:bg-[#18150f]">
        <div className="flex flex-wrap items-center gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              aria-pressed={view === v.id}
              className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${view === v.id ? `border-amber-400 ${paper}` : "border-transparent bg-[#f3ead8] dark:bg-[#2f281f]"}`}
            >
              {v.name}
            </button>
          ))}
          <span className="ml-auto text-xs text-stone-500">{shown.length ? `打開 ${shown.length} 張` : ""}</span>
        </div>
        {view !== "info" && <p className="px-1 text-xs text-stone-500">同一種工具也有很多種玩法。撇步是一般常識整理，不是投資建議；數字是過去的例子，不代表以後。</p>}
        {shown.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-stone-300 p-5 text-center text-sm text-stone-500 dark:border-stone-700">
            點上面的房子，這裡會打開它的卡。可以點好幾間一起比。
          </p>
        ) : (
          <ul className="space-y-2.5">
            {shown.map((t) => (
              <Card key={t.id} t={t} view={view} close={() => pick(t.id)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
