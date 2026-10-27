"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cleanCode, isCode } from "@/lib/stock";

// 打股號按查，用網址帶過去（?code=3008），這樣可以把連結貼給別人。
export default function StockForm({ initial }: { initial: string }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const code = cleanCode(v);
  const ok = isCode(code);
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) router.push(`/stock?code=${code}`);
      }}
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        inputMode="numeric"
        placeholder="股號，例如 3008"
        aria-label="股號"
        className="w-40 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base tabular-nums dark:border-zinc-700"
      />
      <button
        type="submit"
        disabled={!ok}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
      >
        查
      </button>
    </form>
  );
}
