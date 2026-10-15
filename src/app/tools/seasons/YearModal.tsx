"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SEASONS, type Way } from "@/lib/six";
import type { Tone, Year } from "@/lib/sixYear";

// 「**粗體**」→ <b>
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((t, i) => (i % 2 ? <b key={i}>{t}</b> : <span key={i}>{t}</span>))}
    </>
  );
}

const SKY = ["🌤️", "☀️", "🌥️", "🌨️"];
const X = [34, 94, 154, 214, 270];
const y = (p: number) => 70 - (p - 100) * 0.9;
// 台股習慣：漲紅跌綠
const toneFill = (t: Tone) => (t === "up" ? "#dc2626" : "#059669");
const fmt = (v: number) => Math.round(v * 10) / 10;

export default function YearModal({ way, year, onClose }: { way: Way; year: Year; onClose: () => void }) {
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [anim, setAnim] = useState(false);
  const line = useRef<SVGPolylineElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const s = year.seasons[SEASONS[k].id];
  const pts: [number, number][] = [[X[0], y(100)], ...SEASONS.slice(0, k + 1).map((se, i) => [X[i + 1], y(year.seasons[se.id].price)] as [number, number])];
  const got = fmt(SEASONS.slice(0, k + 1).reduce((a, se) => a + year.seasons[se.id].income, 0));
  const last = pts[pts.length - 1];

  // 一季一季自動播
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setK((v) => {
        if (v >= 3) {
          setPlaying(false);
          return v;
        }
        return v + 1;
      });
    }, 5200);
    return () => clearInterval(t);
  }, [playing]);

  // 股價線：只把這一季新增的那一段畫出來
  useLayoutEffect(() => {
    const el = line.current;
    if (!el) return;
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const a = pts[pts.length - 2];
    const seg = Math.hypot(last[0] - a[0], last[1] - a[1]);
    el.style.transition = "none";
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(anim ? seg : 0);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.transition = "stroke-dashoffset 1.2s ease";
        el.style.strokeDashoffset = "0";
      }),
    );
    return () => cancelAnimationFrame(raf);
  });

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const go = (n: number) => {
    setPlaying(false);
    setAnim(true);
    setK(n);
  };
  const play = () => {
    if (playing) return setPlaying(false);
    setAnim(true);
    setK(0);
    setPlaying(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`${way.name}的一年`}
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-stone-50 p-4 shadow-2xl dark:bg-zinc-900">
        <button ref={closeBtn} onClick={onClose} aria-label="關閉" className="absolute right-3 top-3 h-9 w-9 rounded-full bg-zinc-200 text-lg dark:bg-zinc-700">
          ✕
        </button>
        <div className="mr-12 flex items-center gap-3">
          <span className="text-3xl">{way.icon}</span>
          <div>
            <h2 className="text-xl font-semibold">{way.name}的一年</h2>
            <p className="text-xs text-zinc-500">
              {way.tool}・
              <Link href={`/tools#${way.toolId}`} className="text-blue-600">
                看工具卡 →
              </Link>
            </p>
          </div>
        </div>
        <p className="my-2 text-sm text-zinc-600 dark:text-zinc-400">{year.lead}</p>

        <div className="mb-3 flex flex-wrap gap-2">
          <button onClick={play} className="rounded-full bg-zinc-200 px-3 py-1 text-sm font-semibold dark:bg-zinc-700">
            {playing ? "⏸ 暫停" : "▶ 播放一整年"}
          </button>
          {SEASONS.map((se, i) => (
            <button
              key={se.id}
              onClick={() => go(i)}
              aria-pressed={i === k}
              className={`rounded-full border-2 px-3 py-1 text-sm font-semibold ${i === k ? "border-amber-400 bg-white dark:bg-zinc-800" : "border-transparent bg-zinc-200 dark:bg-zinc-700"}`}
            >
              {se.name}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1.15fr_1fr]">
          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-2 flex items-center gap-3">
              <svg viewBox="0 0 80 80" className="w-14 flex-none" aria-hidden>
                <g style={{ transform: `rotate(${45 - k * 90}deg)`, transformOrigin: "40px 40px", transition: "transform 1s cubic-bezier(.5,1.6,.5,1)" }}>
                  <circle cx="40" cy="40" r="36" className="fill-amber-50 stroke-zinc-300 dark:fill-zinc-800 dark:stroke-zinc-600" strokeWidth="2" />
                  <line x1="40" y1="4" x2="40" y2="76" className="stroke-zinc-300 dark:stroke-zinc-600" />
                  <line x1="4" y1="40" x2="76" y2="40" className="stroke-zinc-300 dark:stroke-zinc-600" />
                  <text x="22" y="30" fontSize="16" textAnchor="middle">🌱</text>
                  <text x="58" y="30" fontSize="16" textAnchor="middle">☀️</text>
                  <text x="58" y="62" fontSize="16" textAnchor="middle">🍂</text>
                  <text x="22" y="62" fontSize="16" textAnchor="middle">❄️</text>
                </g>
                <polygon points="40,0 35,8 45,8" className="fill-amber-500" />
              </svg>
              <div>
                <b className="text-lg">{SEASONS[k].name}</b>
                <br />
                <span className="text-sm text-zinc-500">{SEASONS[k].desc}</span>
              </div>
            </div>
            <svg viewBox="0 0 360 190" className="w-full" aria-hidden>
              <rect width="360" height="190" rx="12" className="fill-amber-50 dark:fill-zinc-800" />
              <text x="324" y="38" fontSize="26" textAnchor="middle">{SKY[k]}</text>
              <rect y="150" width="360" height="40" className="fill-amber-100 dark:fill-zinc-700" />
              <circle cx="100" cy="100" r="58" className="fill-white stroke-zinc-300 dark:fill-zinc-900 dark:stroke-zinc-600" strokeWidth="2" />
              <text x="100" y="120" fontSize="54" textAnchor="middle">{way.icon}</text>
              {s.tag && (
                <text x="100" y="30" fontSize="12" textAnchor="middle" fontWeight="800" fill="#dc2626">
                  {s.tag}
                </text>
              )}
              {[year.f1, year.f2].map(([icon, name], i) => {
                const [v, tone] = i ? s.f2 : s.f1;
                const cx = i ? 300 : 232;
                return (
                  <g key={name}>
                    <text x={cx} y="96" fontSize="13" textAnchor="middle" fontWeight="800" fill={toneFill(tone)}>{v}</text>
                    <text x={cx} y="132" fontSize="26" textAnchor="middle">{icon}</text>
                    <text x={cx} y="168" fontSize="10" textAnchor="middle" className="fill-zinc-500">{name}</text>
                  </g>
                );
              })}
            </svg>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {year.meters.map((m, i) => (
                <div key={m} className="rounded-lg bg-amber-50 p-2 text-center dark:bg-zinc-800">
                  <small className="block text-[11px] text-zinc-500">{m}</small>
                  <b className="text-sm">{s.meters[i]}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div key={k} className="min-h-[5.2em] space-y-1">
              {s.say.map((t, i) => (
                <p key={i} className="year-line" style={{ animationDelay: anim ? `${0.4 + i * 0.9}s` : "0s" }}>
                  <Rich text={t} />
                </p>
              ))}
            </div>
            {s.box && (
              <p className="mt-2 rounded-lg border-2 border-dashed border-amber-400 p-2 text-sm">
                <Rich text={s.box} />
              </p>
            )}
            <svg viewBox="0 0 300 130" className="mt-2 w-full" aria-label={`${year.chart}：${s.price}`}>
              <text x="4" y="14" fontSize="11" className="fill-zinc-500">{year.chart}</text>
              <line x1="30" y1="70" x2="296" y2="70" className="stroke-zinc-300 dark:stroke-zinc-600" strokeDasharray="4 4" />
              <text x="4" y="73" fontSize="10" className="fill-zinc-500">100</text>
              {["春", "夏", "秋", "冬"].map((t, i) => (
                <text key={t} x={X[i + 1]} y="126" fontSize="10" textAnchor="middle" className="fill-zinc-500">{t}</text>
              ))}
              <polyline ref={line} points={pts.map((p) => p.join(",")).join(" ")} fill="none" className="stroke-amber-500" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={last[0]} cy={last[1]} r="5" fill={s.price > 100 ? "#dc2626" : s.price < 100 ? "#059669" : "#a1a1aa"} />
              <text x={Math.min(last[0] + 6, 262)} y={last[1] - 8} fontSize="12" fontWeight="800" className="fill-zinc-900 dark:fill-zinc-100">{s.price}</text>
            </svg>
            <div className="mt-2 flex items-center gap-3 rounded-xl bg-amber-50 p-3 dark:bg-zinc-800">
              <span className="text-3xl">{s.face}</span>
              <div>
                <small className="block text-xs text-zinc-500">你的 100 元現在值</small>
                <b key={k} className="year-pop inline-block text-xl tabular-nums">{fmt(s.price + got)} 元</b>
                <small className="block text-xs text-zinc-500">
                  {s.note}
                  {got > 0 && `（${year.chart} ${s.price} ＋ 已收${year.income} ${got}）`}
                </small>
              </div>
            </div>
          </div>
        </div>

        {k === 3 && (
          <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <b className="block">記住一句話</b>
            {year.end}
          </div>
        )}
        <p className="mt-2 text-xs text-zinc-500">數字是為了說故事編的，不是真實的數字。</p>
      </div>
    </div>
  );
}
