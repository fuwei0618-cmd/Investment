"use client";

import { useState } from "react";
import { CITY, GICS, GICS_NOTES, LIFE, Place } from "@/lib/views";
import { NEED_SECTORS } from "@/lib/compassData";
import { CHAINS } from "@/lib/chains";
import { usePersistentState } from "@/lib/storage";
import DayMap from "./DayMap";
import { openChain, useTailwind } from "./sectorTools";

const VIEWS = [
  { key: "day", label: "🕗 你的一天" },
  { key: "city", label: "🏙️ 一座城市" },
  { key: "life", label: "🍚 食衣住行" },
  { key: "gics", label: "📋 課程標準" },
] as const;
type ViewKey = (typeof VIEWS)[number]["key"];

function Tailwind({ sector }: { sector: string }) {
  const { fits } = useTailwind();
  return fits(sector) ? (
    <span className="ml-1.5 rounded bg-emerald-100 px-1.5 text-xs font-normal text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">順風</span>
  ) : null;
}

function ChainLink({ chain }: { chain?: string }) {
  const c = CHAINS.find((x) => x.key === chain);
  return c ? (
    <button onClick={() => openChain(c.key)} className="text-blue-600">
      看產業鏈：{c.title} →
    </button>
  ) : null;
}

// 一座城市：點一棟建築，亮出它從誰拿東西、送東西給誰。
function CityMap() {
  const [sel, setSel] = useState("power");
  const p = CITY.find((c) => c.id === sel)!;
  const byId = (id: string) => CITY.find((c) => c.id === id)!;
  const from = CITY.filter((c) => c.feeds.includes(sel));
  const links = CITY.flatMap((a) => a.feeds.map((b) => ({ a, b: byId(b) })));
  const lit = (a: Place, b: Place) => a.id === sel || b.id === sel;
  return (
    <div className="space-y-3">
      <p>
        把一座城市當成一張產業地圖：每棟建築是一個產業，線是東西、電或錢的流向。點一棟建築，看它從誰那裡拿東西、又送去給誰。
      </p>
      <div className="mx-auto max-w-md">
        <svg viewBox="0 0 360 300" className="w-full select-none rounded-lg bg-emerald-50 dark:bg-zinc-800/60">
          <path d="M0 240 Q 40 230 70 300 L0 300 Z" className="fill-sky-300/70 dark:fill-sky-900" />
          <path d="M0 160 H360 M0 80 H360 M110 0 V300 M210 0 V300" className="stroke-white dark:stroke-zinc-700" strokeWidth={8} />
          {links.map(({ a, b }) => (
            <line
              key={`${a.id}-${b.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={lit(a, b) ? (a.id === sel ? "flow stroke-amber-500" : "flow stroke-sky-500") : "stroke-zinc-400/30"}
              strokeWidth={lit(a, b) ? 2.5 : 1}
              strokeDasharray={lit(a, b) ? "6 5" : undefined}
            />
          ))}
          {CITY.map((c) => {
            const on = c.id === sel;
            const near = from.some((f) => f.id === c.id) || p.feeds.includes(c.id);
            return (
              <g key={c.id} onClick={() => setSel(c.id)} className="cursor-pointer">
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={on ? 21 : 17}
                  className={`transition-all ${on ? "fill-amber-300 stroke-amber-500" : near ? "fill-white stroke-sky-500" : "fill-white stroke-zinc-300 dark:fill-zinc-900 dark:stroke-zinc-600"}`}
                  strokeWidth={2}
                />
                <text x={c.x} y={c.y + 6} textAnchor="middle" className="text-[17px]">
                  {c.icon}
                </text>
                <text
                  x={c.x}
                  y={c.y + (on ? 34 : 30)}
                  textAnchor="middle"
                  className={`text-[9.5px] ${on ? "fill-zinc-900 font-semibold dark:fill-white" : "fill-zinc-600 dark:fill-zinc-300"}`}
                >
                  {c.name.length > 7 ? c.name.slice(0, 6) + "…" : c.name}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-1 flex gap-3 text-xs text-zinc-500">
          <span>
            <span className="text-sky-600">━</span> 送東西過來
          </span>
          <span>
            <span className="text-amber-500">━</span> 送東西出去
          </span>
        </p>
      </div>
      <div key={sel} className="animate-rise space-y-1.5 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="font-medium">
          {p.icon} {p.name}
          <span className="ml-2 text-xs font-normal text-zinc-500">{p.sector}</span>
          <Tailwind sector={p.sector} />
        </p>
        <p>{p.does}</p>
        {from.length > 0 && (
          <p>
            <span className="text-zinc-500">從這裡拿東西：</span>
            {from.map((f) => (
              <button key={f.id} onClick={() => setSel(f.id)} className="mr-1.5 text-sky-700 underline dark:text-sky-300">
                {f.name}
              </button>
            ))}
          </p>
        )}
        <p>
          <span className="text-zinc-500">送去給：</span>
          {p.feeds.map((id) => (
            <button key={id} onClick={() => setSel(id)} className="mr-1.5 text-amber-700 underline dark:text-amber-300">
              {byId(id).name}
            </button>
          ))}
        </p>
        <p>
          <span className="text-zinc-500">例子：</span>
          {p.companies}
        </p>
        <ChainLink chain={p.chain} />
      </div>
    </div>
  );
}

// 食衣住行育樂＋醫＋工作：生活裡的每種花費，背後是哪些產業（原本的完整產業表也併在這）。
function LifeView() {
  const [open, setOpen] = useState<string>("food");
  const part = LIFE.find((l) => l.key === open)!;
  return (
    <div className="space-y-3">
      <p>用「食衣住行育樂」來分，再加上看病和工作。點一格，看這類花費的錢流進哪些產業。</p>
      <div className="grid grid-cols-4 gap-2">
        {LIFE.map((l) => (
          <button
            key={l.key}
            onClick={() => setOpen(l.key)}
            className={`flex flex-col items-center rounded-lg border py-2 transition-transform ${
              l.key === open ? "scale-105 border-amber-400 bg-amber-50 dark:bg-amber-950" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <span className="text-2xl">{l.icon}</span>
            <span className="text-xs font-medium">{l.name}</span>
          </button>
        ))}
      </div>
      <div key={open} className="animate-rise space-y-2">
        <p className="text-zinc-600 dark:text-zinc-400">你花的錢：{part.you}</p>
        {part.sectors.map((s) => {
          const info = NEED_SECTORS.find((n) => n.sector === s.sector);
          return (
            <div key={s.sector} className="space-y-1 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="font-medium">
                {s.sector}
                {info && <span className="ml-1.5 text-xs font-normal text-zinc-500">{info.etf}</span>}
                <Tailwind sector={s.sector} />
              </p>
              <p>{s.what}</p>
              {info && (
                <>
                  <p className="text-xs">
                    <span className="text-zinc-500">景氣什麼時候對它好：</span>
                    {info.cycle}
                  </p>
                  <p className="text-xs">
                    <span className="text-zinc-500">看什麼：</span>
                    {info.watch}
                  </p>
                  {info.trend && (
                    <p className="text-xs">
                      <span className="text-zinc-500">長期趨勢：</span>
                      {info.trend}
                    </p>
                  )}
                </>
              )}
              <ChainLink chain={s.chain} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 課程講的產業分類標準 GICS：11 個板塊、25 個行業組。
function GicsView() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <p>
        這是課程（總經X產業X個股 3-2）介紹的<strong>全球行業分類標準 GICS</strong>：MSCI 和標普在 1999 年編的，照公司主要做什麼生意、靠什麼賺錢來分。2023 年改版後，第一層是 11 個板塊，往下分成 25 個行業組。全球大部分產業 ETF 都照這套分。
      </p>
      <ul className="space-y-1.5">
        {GICS.map((g, i) => (
          <li key={g.sector} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
            <button
              onClick={() => setOpen(open === g.sector ? null : g.sector)}
              className="flex w-full items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-left dark:border-zinc-800"
            >
              <span className="w-5 shrink-0 text-xs text-zinc-400">{i + 1}</span>
              <span className="flex-1">
                <span className="font-medium">{g.sector}</span>
                <Tailwind sector={g.sector} />
                <span className="block text-xs text-zinc-500">{g.plain}</span>
              </span>
              <span
                className={`shrink-0 rounded px-1.5 text-xs ${
                  g.kind === "防禦"
                    ? "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100"
                    : g.kind === "成長"
                      ? "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100"
                      : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {g.kind}
              </span>
            </button>
            {open === g.sector && (
              <div className="animate-rise ml-7 space-y-1 border-l-2 border-zinc-200 py-2 pl-3 text-xs dark:border-zinc-700">
                <p>
                  <span className="text-zinc-500">英文：</span>
                  {g.en}
                  <span className="ml-2 text-zinc-500">ETF：</span>
                  {g.etf}
                </p>
                <p>
                  <span className="text-zinc-500">往下分成：</span>
                  {g.groups.join("、")}
                </p>
                <p>
                  <span className="text-zinc-500">例子：</span>
                  {g.examples}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
      <ul className="list-inside list-disc text-xs text-zinc-600 dark:text-zinc-400">
        {GICS_NOTES.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <p className="text-xs text-zinc-500">循環＝跟著景氣大起大落；防禦＝景氣差也照樣有人買；成長＝靠新科技長期往上。這個標籤是本站為了好懂加的，不是 GICS 的一部分。</p>
    </div>
  );
}

// 第 4 關：同一群產業，換四種角度看。
export default function IndustryViews() {
  const [view, setView] = usePersistentState<ViewKey>("market.industryView.v1", "day");
  const { phaseName, focus } = useTailwind();
  return (
    <div data-tour="sectors" className="space-y-3 text-sm">
      <div className="flex gap-1 overflow-x-auto">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
              view === v.key ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        第 3 關的季節是「{phaseName}」，羅盤建議：{focus}。標「順風」的就是現在比較有利的產業。
      </p>
      <div key={view} className="animate-rise">
        {view === "day" ? <DayMap /> : view === "city" ? <CityMap /> : view === "life" ? <LifeView /> : <GicsView />}
      </div>
    </div>
  );
}
