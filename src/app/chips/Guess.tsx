"use client";

import { useEffect, useState } from "react";

// 猜猜明天：猜下一個交易日外資會買還是賣，隔天打開自動對答案。只存在這台瀏覽器。
const KEY = "chips.guess.v1";
type Pick = "buy" | "sell";
interface Save {
  pending?: { after: string; pick: Pick };
  hits: number;
  total: number;
  last?: { date: string; pick: Pick; right: boolean; net: number };
}

const load = (): Save => {
  try {
    return { hits: 0, total: 0, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return { hits: 0, total: 0 };
  }
};
const save = (s: Save) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
};
const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

export default function Guess({ days }: { days: { date: string; foreign: number }[] }) {
  const [s, setS] = useState<Save | null>(null);
  const latest = days.at(-1)!;
  useEffect(() => {
    const cur = load();
    // 有猜過、而且已經有下一天的答案，就對答案
    if (cur.pending) {
      const ans = days.find((d) => d.date > cur.pending!.after);
      if (ans) {
        const right = (ans.foreign >= 0) === (cur.pending.pick === "buy");
        cur.last = { date: ans.date, pick: cur.pending.pick, right, net: ans.foreign };
        cur.total += 1;
        if (right) cur.hits += 1;
        delete cur.pending;
        save(cur);
      }
    }
    const raf = requestAnimationFrame(() => setS(cur));
    return () => cancelAnimationFrame(raf);
  }, [days]);
  if (!s) return null;
  const choose = (pick: Pick) => {
    const next = { ...s, pending: { after: latest.date, pick } };
    save(next);
    setS(next);
  };
  return (
    <div className="space-y-2 text-sm">
      {s.last && (
        <p className={`animate-rise rounded-xl p-2.5 ${s.last.right ? "bg-amber-100 dark:bg-amber-900/50" : "bg-stone-100 dark:bg-stone-800"}`}>
          {s.last.right ? "🎉 猜對了！" : "😅 差一點。"}你猜 {md(s.last.date)} 外資會{s.last.pick === "buy" ? "買" : "賣"}，結果{s.last.net >= 0 ? "買" : "賣"}了 {Math.abs(s.last.net).toFixed(0)} 億。
        </p>
      )}
      {s.pending ? (
        <p className="rounded-xl bg-[#f3ead8] p-2.5 dark:bg-[#2f281f]">
          🔮 你猜下一個交易日外資會<b>{s.pending.pick === "buy" ? "買" : "賣"}</b>。收盤後回來看答案。
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#f3ead8] p-2.5 dark:bg-[#2f281f]">
          <span>🔮 {md(latest.date)} 之後的下一個交易日，外資會…</span>
          <button onClick={() => choose("buy")} className="rounded-full bg-red-500 px-3 py-1 font-bold text-white">
            買超
          </button>
          <button onClick={() => choose("sell")} className="rounded-full bg-emerald-600 px-3 py-1 font-bold text-white">
            賣超
          </button>
        </div>
      )}
      <p className="text-xs text-stone-500">
        你的命中率：{s.total ? `${s.hits} / ${s.total}（${Math.round((s.hits / s.total) * 100)}%）` : "還沒猜過"}。提示：連續買很多天之後，常常還會再買一陣子；但大事件一來就會突然轉向。
      </p>
    </div>
  );
}
