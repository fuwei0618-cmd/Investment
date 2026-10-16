"use client";

import Link from "next/link";
import { useState } from "react";
import { ACTS, SCENES, type ActPage, type Cast } from "@/lib/acts";

export function Face({ c, size = "md" }: { c: Cast; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "h-16 w-16 text-2xl border-4" : size === "md" ? "h-10 w-10 text-base" : "h-8 w-8 text-sm";
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full border-[#fffdf8] font-black text-white ${s}`} style={{ background: c.tone }}>
      {c.face}
    </span>
  );
}

// 有 # 或靜態遊戲頁用一般連結
export function PageLink({ p, className, children }: { p: ActPage; className: string; children: React.ReactNode }) {
  if (p.href.includes("#") || p.href.endsWith(".html"))
    return (
      <a href={p.href} className={className}>
        {children}
      </a>
    );
  return (
    <Link href={p.href} className={className}>
      {children}
    </Link>
  );
}

// 首頁的麵包鎮小劇場：一幕一幕切換，台上的道具就是網站上的頁面
export default function Stage() {
  const [n, setN] = useState(1);
  const act = ACTS[n - 1];
  const sc = SCENES[n];
  const go = (k: number) => setN(((k - 1 + ACTS.length) % ACTS.length) + 1);
  return (
    <section className="space-y-3">
      <div className="px-1">
        <h1 className="text-2xl font-black">麵包鎮小劇場：新鎮民小麥的一天</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">投資分六步，一步一幕，從早上演到晚上。第一次照順序看；季節換了，再從第二幕走一次。</p>
      </div>

      <ol className="grid grid-cols-3 gap-1.5 md:grid-cols-6">
        {ACTS.map((a) => {
          const on = a.n === n;
          return (
            <li key={a.n}>
              <button
                onClick={() => setN(a.n)}
                aria-pressed={on}
                className={`h-full w-full rounded-2xl px-2.5 py-2 text-left ${on ? "bg-[#b4651e] text-white" : "bg-[#f3ead8] hover:bg-[#ecdfc4] dark:bg-[#2f281f]"}`}
              >
                <b className="block text-sm leading-tight">
                  第{a.n}幕・{a.title}
                </b>
                <span className={`block text-xs leading-snug ${on ? "text-white/85" : "text-stone-600 dark:text-stone-400"}`}>
                  投資第 {a.n} 步：{a.q}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* 舞台：紅色布幕框、天空、房子、角色、對話 */}
      <div className="rounded-[26px] bg-[#6b1f1f] p-2.5 shadow-[0_10px_30px_rgba(60,20,10,.25)] sm:p-3.5">
        <div className="h-4 rounded-t-xl bg-[repeating-linear-gradient(90deg,#8f2a26_0_32px,#7a2320_32px_64px)]" />
        <div key={n} className="overflow-hidden rounded-b-xl md:grid md:grid-cols-[minmax(0,1fr)_400px]" style={{ background: sc.sky }}>
          <div className="relative h-64 md:h-[340px]">
            <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: sc.ground }} />
            {sc.houses.map((h, i) => (
              <div key={i} className="absolute bottom-20 rounded-t-lg" style={{ left: `${h.x}%`, width: `${h.w}%`, height: h.h * 0.8, background: h.c }}>
                <div className="absolute left-1/2 top-3 h-5 w-2/5 -translate-x-1/2 rounded bg-[#fffaeb]/85" />
                <div className="absolute bottom-0 left-1/2 h-8 w-1/4 -translate-x-1/2 rounded-t-md bg-[#3c230f]/35" />
              </div>
            ))}
            <div className="absolute left-3 top-3 rounded-2xl bg-[#fffdf8]/95 px-3.5 py-2 text-stone-900">
              <p className="text-xs font-bold text-[#8a6a3f]">
                第{n}幕・{sc.time}
              </p>
              <p className="text-xl font-black leading-tight sm:text-2xl">{act.title}</p>
              <p className="text-xs text-stone-600">這一幕回答：{act.q}</p>
            </div>
            <div className="absolute inset-x-0 bottom-5 flex justify-center gap-8 sm:gap-14">
              {sc.cast.map((c, i) => (
                <div key={c.name} className="animate-bob flex flex-col items-center gap-1" style={{ animationDelay: `${i * 0.4}s` }}>
                  <Face c={c} size="lg" />
                  <span className="rounded-full bg-[#fffdf8] px-2.5 py-0.5 text-xs font-bold text-stone-900">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
          <ul className="space-y-2.5 p-3 md:py-5 md:pr-5">
            {sc.lines.map(([who, say], i) => {
              const c = sc.cast[who];
              const me = c.face === "麥";
              return (
                <li key={i} className={`animate-rise flex items-start gap-2 ${me ? "flex-row-reverse" : ""}`} style={{ animationDelay: `${i * 0.35}s` }}>
                  <Face c={c} />
                  <p className="rounded-2xl bg-[#fffdf8] px-3 py-2 text-[15px] leading-relaxed text-stone-900 shadow-sm">
                    <b className="block text-xs text-[#8a6a3f]">{c.name}</b>
                    {say}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* 台上的道具＝這一幕的頁面 */}
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]">
          <p className="mb-2 px-1 font-black">台上的道具（點了就進去）</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {act.pages.map((p) => (
              <li key={p.href}>
                <PageLink p={p} className="block h-full rounded-xl bg-[#fffdf8] px-3 py-2 hover:ring-2 hover:ring-amber-400 dark:bg-[#221d16]">
                  <b className="block text-sm">{p.name} →</b>
                  <span className="text-xs text-stone-600 dark:text-stone-400">{p.note}</span>
                </PageLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-[#e6c48a] bg-[#fff4e0] p-3 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="font-black">小麥走出這一幕，手上多了</p>
          <p className="text-sm">{act.take}</p>
          <div className="mt-auto flex justify-end gap-2">
            <button onClick={() => go(n - 1)} className="rounded-full bg-[#fffdf8] px-4 py-2 text-sm font-bold dark:bg-[#221d16]">
              ← 上一幕
            </button>
            <button onClick={() => go(n + 1)} className="rounded-full bg-[#b4651e] px-4 py-2 text-sm font-bold text-white">
              {n === ACTS.length ? "從頭再看 →" : "下一幕 →"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
