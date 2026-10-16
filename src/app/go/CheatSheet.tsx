"use client";

import { useState } from "react";

// 下單小抄：照券商 App 畫面的順序排好，看一格填一格，數字可以點一下複製
export default function CheatSheet({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string; copy?: string }[];
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };
  return (
    <div className="rounded-xl border-2 border-dashed border-[#b4651e] p-3">
      <p className="mb-2 text-sm font-black">🧾 {title}</p>
      <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-sm text-stone-500">{r.label}</dt>
            <dd className="text-lg font-black">{r.value}</dd>
            <dd>
              {r.copy != null && (
                <button
                  onClick={() => copy(r.label, r.copy!)}
                  className="rounded-full bg-[#f3ead8] px-2.5 py-0.5 text-xs font-bold dark:bg-[#2f281f]"
                >
                  {copied === r.label ? "已複製" : "複製"}
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
