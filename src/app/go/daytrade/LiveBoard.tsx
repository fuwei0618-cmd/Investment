"use client";

import { useCallback, useEffect, useState } from "react";
import { isTradingTime, type Live } from "@/lib/dayTrade";
import { fmt, usePersistentState } from "@/lib/storage";

// 盤中即時看：自己的追蹤清單，開盤時間每 30 秒更新一次
export default function LiveBoard({
  suggest,
}: {
  suggest: { code: string; name: string }[];
}) {
  const [codes, setCodes] = usePersistentState<string[]>("live.codes.v1", [
    "2330",
    "0050",
  ]);
  const [quotes, setQuotes] = useState<Live[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [at, setAt] = useState<string>("");
  const [add, setAdd] = useState("");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!codes.length) return setQuotes([]);
    try {
      const res = await fetch(`/api/live?codes=${codes.join(",")}`, {
        cache: "no-store",
      });
      const j = (await res.json()) as { quotes?: Live[]; error?: string };
      if (j.error) throw new Error(j.error);
      setQuotes(j.quotes ?? []);
      setErr(null);
      setAt(new Date().toLocaleTimeString("zh-TW", { hour12: false }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "抓不到即時報價");
    }
  }, [codes]);

  useEffect(() => {
    const first = setTimeout(() => {
      setOpen(isTradingTime());
      load();
    }, 0);
    const id = setInterval(() => {
      const o = isTradingTime();
      setOpen(o);
      if (o) load();
    }, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load]);

  const push = (c: string) => {
    const v = c.trim().toUpperCase();
    if (/^[0-9A-Z]{4,6}$/.test(v) && !codes.includes(v))
      setCodes([...codes, v].slice(0, 20));
    setAdd("");
  };

  return (
    <div className="space-y-3">
      <p className="text-sm">
        {open
          ? "現在是盤中，每 30 秒自動更新一次。"
          : "現在不是盤中（週一到週五 9:00–13:30），顯示的是最後一筆價格。"}
        {at && <span className="text-xs text-stone-500">　上次更新 {at}</span>}
        <button
          onClick={load}
          className="ml-2 rounded-full bg-[#f3ead8] px-3 py-0.5 text-xs font-bold dark:bg-[#2f281f]"
        >
          現在更新
        </button>
      </p>
      {err && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          即時報價暫時抓不到：{err}
          。如果一直這樣，代表證交所擋了網站的主機，要改用富果的行情 API。
        </p>
      )}
      <ul className="grid gap-2 sm:grid-cols-2">
        {codes.map((c) => {
          const q = quotes.find((x) => x.code === c);
          const chg = q?.price && q.prev ? q.price / q.prev - 1 : null;
          const tone =
            chg == null
              ? ""
              : chg > 0
                ? "text-red-600"
                : chg < 0
                  ? "text-green-700"
                  : "";
          return (
            <li
              key={c}
              className="rounded-xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <b>
                  {q?.name ?? c}{" "}
                  <span className="text-sm text-stone-500">{c}</span>
                </b>
                <button
                  onClick={() => setCodes(codes.filter((x) => x !== c))}
                  className="text-xs text-stone-500 underline"
                >
                  移除
                </button>
              </div>
              {q ? (
                <>
                  <span className={`text-2xl font-black ${tone}`}>
                    {q.price ? fmt(q.price, 2) : "—"}
                  </span>
                  {chg != null && (
                    <span className={`ml-2 font-bold ${tone}`}>
                      {chg > 0 ? "▲" : chg < 0 ? "▼" : ""}{" "}
                      {(chg * 100).toFixed(2)}%
                    </span>
                  )}
                  <span className="block text-xs text-stone-500">
                    昨收 {fmt(q.prev, 2)}・最高 {q.high ? fmt(q.high, 2) : "—"}
                    ・最低 {q.low ? fmt(q.low, 2) : "—"}・成交 {fmt(q.vol)} 張・
                    {q.time}
                  </span>
                </>
              ) : (
                <span className="block text-sm text-stone-500">
                  {err ? "抓不到" : "讀取中⋯⋯"}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={add}
          onChange={(e) => setAdd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push(add)}
          placeholder="輸入股票代號，例如 2317"
          className="rounded-xl border-2 border-stone-200 bg-white px-3 py-1.5 dark:border-stone-700 dark:bg-stone-900"
        />
        <button
          onClick={() => push(add)}
          className="rounded-full bg-[#b4651e] px-4 py-1.5 text-sm font-bold text-white"
        >
          加入追蹤
        </button>
      </div>
      {suggest.length > 0 && (
        <p className="flex flex-wrap gap-1.5 text-sm">
          <span className="text-stone-500">昨天當沖最熱的：</span>
          {suggest
            .filter((s) => !codes.includes(s.code))
            .slice(0, 6)
            .map((s) => (
              <button
                key={s.code}
                onClick={() => push(s.code)}
                className="rounded-full bg-white px-2.5 py-0.5 dark:bg-stone-900"
              >
                ＋{s.name}
              </button>
            ))}
        </p>
      )}
    </div>
  );
}
