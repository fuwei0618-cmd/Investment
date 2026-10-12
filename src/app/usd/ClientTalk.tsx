"use client";

import { useState } from "react";

// 跟客戶聊美元：每段可以展開，也可以整份複製到 LINE。
export default function ClientTalk({ items }: { items: { title: string; say: string }[] }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const text = items
      .filter((i) => i.title !== "不要說的話")
      .map((i, n) => `${n + 1}. ${i.title}\n${i.say}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="space-y-2">
      <ol className="space-y-2">
        {items.map((i, n) => (
          <li
            key={i.title}
            className={`rounded-md border p-3 ${
              i.title === "不要說的話" ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <p className="font-medium">
              {i.title === "不要說的話" ? "⚠️" : `${n + 1}.`} {i.title}
            </p>
            <p className="text-zinc-700 dark:text-zinc-300">{i.say}</p>
          </li>
        ))}
      </ol>
      <button onClick={copy} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
        {copied ? "已複製 ✓" : "複製說法（貼到 LINE 或筆記）"}
      </button>
    </div>
  );
}
