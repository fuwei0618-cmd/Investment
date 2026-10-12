"use client";

import Link from "next/link";
import { usePersistentState } from "@/lib/storage";
import type { RiskResult } from "@/lib/risk";
import type { Trade } from "@/lib/portfolio";

export default function MoneySteps() {
  const [risk] = usePersistentState<RiskResult | null>("risk.result.v1", null);
  const [trades] = usePersistentState<Trade[]>("portfolio.trades.v1", []);
  const steps = [
    {
      n: 1,
      href: "/goals",
      q: "我要存多少錢才夠？",
      text: "輸入年紀、收入、花費，算出退休要準備多少，以及每個月該存多少。",
      status: "隨時可以改數字重算",
    },
    {
      n: 2,
      href: "/risk",
      q: "我能承受多少風險？",
      text: "20 題問卷，算出你適合放多少錢在股票、多少錢在安全的地方。",
      status: risk ? `已完成：${risk.type.name}（${risk.total} 分）` : "還沒做",
    },
    {
      n: 3,
      href: "/portfolio",
      q: "我手上的投資健康嗎？",
      text: "記下買賣紀錄，自動算賺賠，檢查股票放太多、或單一檔佔太重。",
      status: trades.length ? `已記 ${trades.length} 筆交易` : "還沒記錄",
    },
  ];
  return (
    <ol className="space-y-3">
      {steps.map((s) => (
        <li key={s.n}>
          <Link
            href={s.href}
            className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-semibold text-white">
              {s.n}
            </span>
            <span>
              <span className="block text-lg font-medium">{s.q}</span>
              <span className="block text-sm">{s.text}</span>
              <span className="mt-1 block text-xs text-zinc-500">{s.status}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
