"use client";

import { useState } from "react";
import { CITY, GICS, GICS_NOTES, LIFE, MARKET_MIX, Place, STAGES, TRENDS, TW_US, TW_US_PAIRS } from "@/lib/views";
import { NEED_SECTORS } from "@/lib/compassData";
import { CHAINS } from "@/lib/chains";
import { usePersistentState } from "@/lib/storage";
import DayMap from "./DayMap";
import { openChain, useTailwind } from "./sectorTools";

const VIEWS = [
  { key: "day", label: "🕗 你的一天" },
  { key: "city", label: "🏙️ 一座城市" },
  { key: "life", label: "🍚 食衣住行" },
  { key: "stage", label: "🔗 上中下游" },
  { key: "twus", label: "⚖️ 台灣vs美國" },
  { key: "trend", label: "🚀 大趨勢" },
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

// 上中下游：把每條產業鏈的同一段放在一起比。
function StageView() {
  const [stage, setStage] = useState<(typeof STAGES)[number]["stage"]>("上游");
  const st = STAGES.find((x) => x.stage === stage)!;
  return (
    <div className="space-y-3">
      <p>每條產業鏈都能切成上游、中游、下游三段。同一段的公司，不管在哪個產業，賺錢方式和遇到景氣的反應都很像。</p>
      <div className="flex items-stretch gap-1">
        {STAGES.map((x, i) => (
          <div key={x.stage} className="flex flex-1 items-center gap-1">
            <button
              onClick={() => setStage(x.stage)}
              className={`flex flex-1 flex-col items-center rounded-lg border py-2 transition-transform ${
                x.stage === stage ? "scale-105 border-amber-400 bg-amber-50 dark:bg-amber-950" : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <span className="text-2xl">{x.icon}</span>
              <span className="text-xs font-medium">{x.stage}</span>
            </button>
            {i < STAGES.length - 1 && <span className="text-zinc-400">→</span>}
          </div>
        ))}
      </div>
      <div key={stage} className="animate-rise space-y-3">
        <div className="space-y-1 rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
          <p className="font-medium">
            {st.plain}
            <span className="ml-1.5 text-xs font-normal text-zinc-500">{st.like}</span>
          </p>
          <p>
            <span className="text-zinc-500">怎麼賺錢：</span>
            {st.money}
          </p>
          <p>
            <span className="text-zinc-500">要看什麼：</span>
            {st.watch}
          </p>
        </div>
        <p className="text-xs text-zinc-500">各產業的{stage}：</p>
        <ul className="space-y-2">
          {CHAINS.flatMap((c) =>
            c.segments
              .filter((g) => g.stage === stage)
              .map((g) => (
                <li key={c.key + g.name} className="space-y-1 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="font-medium">
                    {g.name}
                    <span className="ml-1.5 text-xs font-normal text-zinc-500">{c.title}</span>
                    <Tailwind sector={c.sector} />
                  </p>
                  <p>{g.does}</p>
                  <p className="text-xs text-zinc-500">
                    {g.companies.map((co) => `${co.name}${co.market === "台" ? "🇹🇼" : co.market === "美" ? "🇺🇸" : ""}`).join("、")}
                  </p>
                  <ChainLink chain={c.key} />
                </li>
              )),
          )}
        </ul>
      </div>
    </div>
  );
}

// 台灣 vs 美國：兩邊股市由哪些產業組成、各強在哪。
function TwUsView() {
  const max = Math.max(...MARKET_MIX.flatMap((m) => [m.us, m.tw]));
  return (
    <div className="space-y-3">
      <p>同樣叫「股市」，台灣和美國長得很不一樣。先看兩邊各產業佔多少，就知道大盤漲跌主要跟著誰。</p>
      <div className="grid grid-cols-2 gap-2">
        {[TW_US.tw, TW_US.us].map((m) => (
          <div key={m.name} className="space-y-1 rounded-md border border-zinc-200 p-3 text-xs dark:border-zinc-800">
            <p className="text-sm font-medium">
              {m.flag} {m.name}
            </p>
            <p>
              <span className="text-zinc-500">強項：</span>
              {m.strong}
            </p>
            <p>
              <span className="text-zinc-500">特色：</span>
              {m.feel}
            </p>
            <p>
              <span className="text-zinc-500">要小心：</span>
              {m.risk}
            </p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="flex gap-3 text-xs text-zinc-500">
          <span>各產業佔整個股市幾 %</span>
          <span>
            <span className="text-emerald-600">■</span> 台灣
          </span>
          <span>
            <span className="text-blue-600">■</span> 美國
          </span>
        </p>
        {MARKET_MIX.map((m, i) => (
          <div key={m.sector} className="animate-rise grid grid-cols-[4.5rem_1fr] items-center gap-2 text-xs" style={{ animationDelay: `${i * 40}ms` }}>
            <span>{m.sector}</span>
            <span className="space-y-0.5">
              <span className="flex items-center gap-1">
                <span className="h-2 rounded-full bg-emerald-500" style={{ width: `${(m.tw / max) * 85}%` }} />
                <span className="text-zinc-500">{m.tw}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 rounded-full bg-blue-500" style={{ width: `${(m.us / max) * 85}%` }} />
                <span className="text-zinc-500">{m.us}</span>
              </span>
            </span>
          </div>
        ))}
        <p className="text-xs text-zinc-500">美國是 S&amp;P 500 在 2026 年 10 月的估計；台灣是本站依台積電約佔四成多、電子股為主粗估的，只看大概。</p>
      </div>
      <p className="font-medium">同一條鏈上，美國公司常是台灣公司的客戶</p>
      <ul className="space-y-2">
        {TW_US_PAIRS.map((p) => (
          <li key={p.us} className="space-y-1 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="flex flex-wrap items-center gap-1.5">
              <span>🇺🇸 {p.us}</span>
              <span className="text-zinc-400">⇄</span>
              <span>🇹🇼 {p.tw}</span>
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">{p.how}</p>
            <ChainLink chain={p.chain} />
          </li>
        ))}
      </ul>
      <p className="text-xs text-zinc-500">所以美國大客戶說要多花錢（例如多蓋資料中心），常常是台灣供應商的好消息。</p>
    </div>
  );
}

// 大趨勢：會影響很多年、跨好幾個產業的長期方向。
function TrendView() {
  const [open, setOpen] = useState("ai");
  const t = TRENDS.find((x) => x.key === open)!;
  return (
    <div className="space-y-3">
      <p>景氣季節幾年就換一輪，但有些方向會走十年以上，而且一次帶動好幾個產業。點一個趨勢，看它推動了誰。</p>
      <div className="grid grid-cols-3 gap-2">
        {TRENDS.map((x) => (
          <button
            key={x.key}
            onClick={() => setOpen(x.key)}
            className={`flex flex-col items-center rounded-lg border px-1 py-2 transition-transform ${
              x.key === open ? "scale-105 border-amber-400 bg-amber-50 dark:bg-amber-950" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <span className="text-2xl">{x.icon}</span>
            <span className="text-xs font-medium">{x.name}</span>
          </button>
        ))}
      </div>
      <div key={open} className="animate-rise space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
        <p>{t.what}</p>
        <p className="flex flex-wrap items-center gap-1">
          <span className="text-zinc-500">帶動的產業：</span>
          {t.sectors.map((s) => (
            <span key={s} className="rounded bg-zinc-100 px-1.5 text-xs dark:bg-zinc-800">
              {s}
              <Tailwind sector={s} />
            </span>
          ))}
        </p>
        <p>
          <span className="text-zinc-500">例子：</span>
          {t.examples}
        </p>
        <p>
          <span className="text-zinc-500">要看什麼：</span>
          {t.watch}
        </p>
        <p>
          <span className="text-zinc-500">要小心：</span>
          {t.careful}
        </p>
        <div className="flex flex-col items-start gap-1">
          {t.chains.map((c) => (
            <ChainLink key={c} chain={c} />
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-500">趨勢對，不代表股價一定對：大家都看好的東西常常已經很貴，還是要走完第 6、7 關。</p>
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

// 第 4 關：同一群產業，換七種角度看。
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
        {view === "day" ? (
          <DayMap />
        ) : view === "city" ? (
          <CityMap />
        ) : view === "life" ? (
          <LifeView />
        ) : view === "stage" ? (
          <StageView />
        ) : view === "twus" ? (
          <TwUsView />
        ) : view === "trend" ? (
          <TrendView />
        ) : (
          <GicsView />
        )}
      </div>
    </div>
  );
}
