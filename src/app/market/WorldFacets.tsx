"use client";

import { useState } from "react";
import { GDP_MIX, POPULATION, POP_TEXT, popQuadrant } from "@/lib/world";

const FACETS = [
  { key: "us", label: "美國：主人與狗" },
  { key: "gdp", label: "各國靠什麼賺錢" },
  { key: "pop", label: "人口：長線有沒有人" },
] as const;

// 點太近的國家，名字往旁邊挪一點避免疊在一起。
const LABEL: Record<string, [number, number, "start" | "middle" | "end"]> = {
  墨西哥: [-10, 4, "end"],
  南韓: [-12, 4, "end"],
  台灣: [0, -11, "middle"],
  德國: [12, 4, "start"],
  澳洲: [0, 18, "middle"],
};

const PARTS = [
  { key: "consume", label: "消費", color: "bg-sky-500" },
  { key: "invest", label: "投資", color: "bg-emerald-500" },
  { key: "gov", label: "政府", color: "bg-zinc-400" },
  { key: "net", label: "淨出口", color: "bg-amber-500" },
] as const;

function GdpBars() {
  return (
    <div className="space-y-3 text-sm">
      <p>
        一個國家的經濟（GDP）＝大家花錢＋公司投資＋政府花錢＋賣到國外賺的。哪一塊最大，就決定你要盯哪個數字。
      </p>
      <ul className="space-y-3">
        {GDP_MIX.map((g, i) => (
          <li key={g.country} className="animate-rise space-y-1" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-baseline justify-between">
              <span className="font-medium">
                {g.country}
                <span className="ml-2 rounded bg-zinc-100 px-1.5 text-xs dark:bg-zinc-800">{g.type}</span>
              </span>
              <span className="text-xs text-zinc-500">盯：{g.watch}</span>
            </div>
            <div className="flex h-4 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              {PARTS.map((p) => {
                const v = Math.max(0, g[p.key]);
                return v ? (
                  <div
                    key={p.key}
                    title={`${p.label} ${g[p.key]}%`}
                    className={`animate-grow origin-left ${p.color}`}
                    style={{ width: `${v}%`, animationDelay: `${i * 80}ms` }}
                  />
                ) : null;
              })}
            </div>
            <p className="text-xs tabular-nums text-zinc-500">
              {PARTS.map((p) => `${p.label} ${g[p.key]}%`).join("・")}
            </p>
          </li>
        ))}
      </ul>
      <p className="flex flex-wrap gap-3 text-xs">
        {PARTS.map((p) => (
          <span key={p.key} className="flex items-center gap-1">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${p.color}`} />
            {p.label}
          </span>
        ))}
      </p>
      <p className="rounded-md bg-amber-50 p-3 dark:bg-amber-950">
        所以：美國、日本是「消費型」，看就業和花錢；德國、台灣是「出口型」，看別人買不買（台灣看美國科技需求）；中國是「投資型」，看蓋房子、蓋工廠和政府放錢。
      </p>
      <p className="text-xs text-zinc-500">課程：總經 2-3。比例是約略值，只用來比較。</p>
    </div>
  );
}

function PopulationMap() {
  const [sel, setSel] = useState("台灣");
  const S = 300;
  const C = S / 2;
  const x = (g: number) => C + (g / 2) * (C - 20); // 年增 −2%～+2%
  const y = (d: number) => C - (d / 25) * (C - 20); // −25～+25 百分點
  const p = POPULATION.find((c) => c.country === sel)!;
  const q = popQuadrant(p);
  return (
    <div className="space-y-3 text-sm">
      <p>
        經濟長期能長多快，看「有多少人在工作」。這張圖把國家放進四格：越往上越年輕（小孩比老人多），越往右人口還在增加。
      </p>
      <div className="mx-auto max-w-sm">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full select-none">
          <rect x={C} y={0} width={C} height={C} className="fill-emerald-500/10" />
          <rect x={0} y={C} width={C} height={C} className="fill-red-500/10" />
          <line x1={0} x2={S} y1={C} y2={C} className="stroke-zinc-300 dark:stroke-zinc-700" />
          <line x1={C} x2={C} y1={0} y2={S} className="stroke-zinc-300 dark:stroke-zinc-700" />
          <text x={S - 6} y={16} textAnchor="end" className="fill-emerald-600 text-[11px] font-semibold">
            年輕又在長
          </text>
          <text x={6} y={S - 8} className="fill-red-500 text-[11px] font-semibold">
            變老又在縮
          </text>
          <text x={S - 6} y={S - 8} textAnchor="end" className="fill-zinc-400 text-[10px]">
            人口增加 →
          </text>
          <text x={C + 5} y={30} className="fill-zinc-400 text-[10px]">
            ↑ 小孩比老人多
          </text>
          {POPULATION.map((c, i) => {
            const on = c.country === sel;
            return (
              <g
                key={c.country}
                onClick={() => setSel(c.country)}
                className="animate-rise cursor-pointer"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <circle
                  cx={x(c.growth)}
                  cy={y(c.youngMinusOld)}
                  r={on ? 9 : 6}
                  className={on ? "fill-blue-600" : "fill-zinc-500/70"}
                />
                <text
                  x={x(c.growth) + (LABEL[c.country]?.[0] ?? 0)}
                  y={y(c.youngMinusOld) + (LABEL[c.country]?.[1] ?? -11)}
                  textAnchor={LABEL[c.country]?.[2] ?? "middle"}
                  className={`text-[11px] ${on ? "fill-blue-600 font-semibold" : "fill-zinc-600 dark:fill-zinc-300"}`}
                >
                  {c.country}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
        <p className="font-medium">{p.country}</p>
        <p>
          小孩比老人{p.youngMinusOld >= 0 ? "多" : "少"} {Math.abs(p.youngMinusOld)} 個百分點、人口一年 {p.growth > 0 ? "增加" : "減少"} {Math.abs(p.growth)}%、一半的人超過 {p.medianAge} 歲。
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">{POP_TEXT[q]}。</p>
        <p className="mt-1 text-xs text-zinc-500">點圖上的國家換一個看。</p>
      </div>
      <p className="rounded-md bg-amber-50 p-3 dark:bg-amber-950">
        課程結論：長線最看好人口健康又是消費大國的美國，加上澳洲、印度；台灣、南韓靠出口撐，但人口在變老、受外部影響大；日本最辛苦。台灣人口約在 2030 年前後見頂。
      </p>
      <p className="text-xs text-zinc-500">課程：總經 2-4。數字為聯合國 2024 年推估的約略值。</p>
    </div>
  );
}

// 第 1 關的三個角度：美國（數字卡）、各國經濟結構、人口。
export default function WorldFacets({ us }: { us: React.ReactNode }) {
  const [f, setF] = useState<(typeof FACETS)[number]["key"]>("us");
  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto text-xs">
        {FACETS.map((x) => (
          <button
            key={x.key}
            onClick={() => setF(x.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 ${
              f === x.key ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div key={f} className="animate-rise">
        {f === "us" ? us : f === "gdp" ? <GdpBars /> : <PopulationMap />}
      </div>
    </div>
  );
}
