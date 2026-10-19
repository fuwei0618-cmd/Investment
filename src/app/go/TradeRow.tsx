"use client";

import { useState } from "react";
import type { Holding } from "@/lib/desk";
import { fmt } from "@/lib/storage";

const FIELDS = [
  ["shares", "股數"],
  ["price", "成交價"],
  ["stop", "停損"],
  ["target", "停利"],
] as const;

// 一筆操作紀錄：實際成交跟計畫不一樣時可以改
export default function TradeRow({
  t,
  onSave,
  onDelete,
}: {
  t: Holding;
  onSave: (h: Holding) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing)
    return (
      <li className="space-y-2 rounded-xl bg-[#f3ead8] px-3 py-2 text-sm dark:bg-[#2f281f]">
        <b>
          {t.name} {t.code}
        </b>
        <TradeEdit
          t={t}
          onSave={(h) => {
            onSave(h);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );

  return (
    <li className="flex flex-wrap items-center gap-x-3 rounded-xl bg-[#f3ead8] px-3 py-2 text-sm dark:bg-[#2f281f]">
      <b>
        {t.name} {t.code}
      </b>
      <span>
        {t.saved} 買 {fmt(t.shares, Number.isInteger(t.shares) ? 0 : 2)} 股 @{" "}
        {fmt(t.price, 2)}
      </span>
      <span className="text-green-700 dark:text-green-400">
        停損 {fmt(t.stop, 2)}
      </span>
      <span className="text-red-700 dark:text-red-400">
        停利 {fmt(t.target, 2)}
      </span>
      <span className="ml-auto flex gap-3 text-xs">
        <button
          onClick={() => setEditing(true)}
          className="font-bold text-[#b4651e] underline"
        >
          修改
        </button>
        <button onClick={onDelete} className="text-stone-500 underline">
          沒買成，刪除
        </button>
      </span>
    </li>
  );
}

/** 改一筆紀錄的股數、成交價、停損、停利（帶我做和實戰頁持股共用） */
export function TradeEdit({
  t,
  onSave,
  onCancel,
  className = "",
}: {
  t: Holding;
  onSave: (h: Holding) => void;
  onCancel: () => void;
  className?: string;
}) {
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map(([k]) => [k, String(t[k])])),
  );
  const [fee, setFee] = useState(t.buyFee ? String(t.buyFee) : "");
  const ok = FIELDS.every(([k]) => Number(draft[k]) > 0) && !(Number(fee) < 0);
  return (
    <div className={`space-y-2 text-sm ${className}`}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FIELDS.map(([k, label]) => (
          <label key={k} className="space-y-0.5">
            <span className="text-xs text-stone-500">{label}</span>
            <input
              type="number"
              inputMode="decimal"
              value={draft[k]}
              onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
              className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1 dark:border-stone-600 dark:bg-[#221d16]"
            />
          </label>
        ))}
        <label className="space-y-0.5">
          <span className="text-xs text-stone-500">買進手續費</span>
          <input
            type="number"
            inputMode="decimal"
            value={fee}
            placeholder="0"
            onChange={(e) => setFee(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1 dark:border-stone-600 dark:bg-[#221d16]"
          />
        </label>
      </div>
      <p className="text-xs text-stone-500">
        成交價請填券商成交明細上的「成交價」，不要填含手續費的均價。手續費填明細上的手續費（或「庫存成本」減掉
        成交價×股數），賣掉後成績單會扣掉。
      </p>
      <div className="flex gap-2">
        <button
          disabled={!ok}
          onClick={() => {
            onSave({
              ...t,
              shares: Number(draft.shares),
              price: Number(draft.price),
              stop: Number(draft.stop),
              target: Number(draft.target),
              buyFee: Number(fee) || 0,
            });
          }}
          className="rounded-full bg-[#b4651e] px-3 py-1 font-bold text-white disabled:opacity-40"
        >
          存好
        </button>
        <button
          onClick={onCancel}
          className="rounded-full px-3 py-1 text-stone-500 underline"
        >
          不改了
        </button>
      </div>
    </div>
  );
}
