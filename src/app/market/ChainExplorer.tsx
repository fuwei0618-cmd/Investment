"use client";

import { useState } from "react";
import { CHAINS, Company } from "@/lib/chains";
import { usePersistentState } from "@/lib/storage";

const STAGE_COLOR = {
  上游: "border-sky-500 bg-sky-50 dark:bg-sky-950",
  中游: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
  下游: "border-amber-500 bg-amber-50 dark:bg-amber-950",
} as const;

// 帶著公司名跳到第 6 關：先存進第 6 關清單用的 localStorage，再換關（第 6 關掛載時會讀到）。
function checkCompany(c: Company) {
  try {
    localStorage.setItem("compass.stock.v1", JSON.stringify({ name: `${c.name}（${c.ticker}）`, checks: {} }));
  } catch {}
  window.location.hash = "level-6";
}

// 產業鏈：選一條鏈 → 看上中下游 → 點一段看為什麼需要、往哪發展、有哪些公司 → 點公司進第 6 關。
export default function ChainExplorer() {
  const [key, setKey] = usePersistentState<string>("market.chain.v1", CHAINS[0].key);
  const [seg, setSeg] = useState(0);
  const chain = CHAINS.find((c) => c.key === key) ?? CHAINS[0];
  const s = chain.segments[Math.min(seg, chain.segments.length - 1)];

  return (
    <div className="space-y-3 text-sm">
      <p>
        挑一條產業鏈，從上游一路看到下游。每一段都是別人少不了的環節；點一段看它在做什麼、為什麼需要、往哪裡發展、有哪些公司。
      </p>
      <div className="flex gap-1 overflow-x-auto">
        {CHAINS.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setKey(c.key);
              setSeg(0);
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
              c.key === key ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div key={key} className="animate-rise space-y-3">
        <p className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <span className="text-xs text-zinc-500">
            {chain.need} → {chain.sector}
          </span>
          <span className="block font-medium">{chain.oneLine}</span>
        </p>

        <ol className="space-y-0">
          {chain.segments.map((x, i) => (
            <li key={x.name}>
              {i > 0 && <div className="ml-5 h-3 w-0.5 bg-zinc-300 dark:bg-zinc-700" />}
              <button
                onClick={() => setSeg(i)}
                style={{ animationDelay: `${i * 90}ms` }}
                className={`animate-rise flex w-full items-center gap-2 rounded-md border-l-4 px-3 py-2 text-left ${STAGE_COLOR[x.stage]} ${
                  i === seg ? "ring-2 ring-zinc-900 dark:ring-zinc-100" : ""
                }`}
              >
                <span className="shrink-0 text-xs text-zinc-500">{x.stage}</span>
                <span className="font-medium">{x.name}</span>
                <span className="ml-auto shrink-0 text-xs text-zinc-500">{x.companies.length} 家 ›</span>
              </button>
            </li>
          ))}
        </ol>

        <div key={`${key}-${seg}`} className="animate-rise space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="font-medium">
            {s.stage}・{s.name}
          </p>
          <p>
            <span className="text-zinc-500">在做什麼：</span>
            {s.does}
          </p>
          <p>
            <span className="text-zinc-500">為什麼少不了：</span>
            {s.why}
          </p>
          <p>
            <span className="text-zinc-500">往哪裡發展：</span>
            {s.trend}
          </p>
          <div>
            <p className="mb-1 text-zinc-500">由哪些公司組成（點一家，到第 6 關檢查它是不是贏家）：</p>
            <div className="flex flex-wrap gap-1.5">
              {s.companies.map((c) => (
                <button
                  key={c.ticker}
                  onClick={() => checkCompany(c)}
                  className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs hover:border-blue-600 hover:text-blue-600 dark:border-zinc-700"
                >
                  <span className="mr-1 rounded bg-zinc-100 px-1 text-[10px] dark:bg-zinc-800">{c.market}</span>
                  {c.name} {c.ticker}
                  {c.note && <span className="ml-1 text-zinc-500">・{c.note}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950">
          <p className="font-medium">這條鏈過三關了嗎？</p>
          <p>① 市場夠大：{chain.threeQ.big}</p>
          <p>② 別人很難搶：{chain.threeQ.moat}</p>
          <p>③ 少數幾家在賺：{chain.threeQ.few}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">要盯：{chain.watch}</p>
        </div>
        <p className="text-xs text-zinc-500">代表公司只是例子，不是推薦。</p>
      </div>
    </div>
  );
}
