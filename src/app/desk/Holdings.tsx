"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Live } from "@/lib/dayTrade";
import { holdingAlert, taipeiToday, type Holding } from "@/lib/desk";
import { close, JOURNAL_KEY, type Closed } from "@/lib/journal";
import { fmt, usePersistentState } from "@/lib/storage";
import { buyFeeOf, sellFeeOf } from "@/lib/fees";
import { TradeEdit } from "../go/TradeRow";

const TONE = {
  red: "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100",
  green:
    "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  plain: "bg-[#e9e9e4] dark:bg-[#2a2e34]",
};

/** 讀「帶我做」第六步記下來的單子和現價（持股提醒、最上面「哪檔要賣」共用） */
export function useHoldingQuotes(market: "tw" | "us") {
  const us = market === "us";
  const [trades, setTrades, loaded] = usePersistentState<Holding[]>(
    us ? "us.trades.v1" : "go.trades.v1",
    [],
  );
  const [quotes, setQuotes] = useState<Live[]>([]);
  const [err, setErr] = useState(false);
  const codes = trades.map((t) => t.code).join(",");

  useEffect(() => {
    if (!codes) return;
    fetch(`${us ? "/api/uslive" : "/api/live"}?codes=${codes}`, {
      cache: "no-store",
    })
      .then((r) => r.json() as Promise<{ quotes?: Live[] }>)
      .then((j) => setQuotes(j.quotes ?? []))
      .catch(() => setErr(true));
  }, [codes, us]);
  return { trades, setTrades, loaded, quotes, err };
}

// 我的持股提醒：讀「帶我做」第六步記下來的單子，拿現價比停損停利
export default function Holdings({ market = "tw" }: { market?: "tw" | "us" }) {
  const us = market === "us";
  const { trades, setTrades, loaded, quotes, err } = useHoldingQuotes(market);
  const [journal, setJournal] = usePersistentState<Closed[]>(JOURNAL_KEY, []);
  const [selling, setSelling] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  if (!loaded) return <p className="text-sm text-stone-500">讀取中⋯⋯</p>;
  if (!trades.length)
    return (
      <p className="text-sm">
        還沒有記下來的持股。照策略卡「帶我做」買完，第六步按「記下來」，這裡就會每天幫你盯停損停利。
        <Link
          href={us ? "/go/us-stock" : "/go/tw-stock"}
          className="ml-1 text-blue-700 underline dark:text-blue-400"
        >
          去帶我做 →
        </Link>
      </p>
    );
  return (
    <ul className="space-y-2">
      {trades.map((t) => {
        const q = quotes.find((x) => x.code === t.code);
        const now = q?.price || q?.prev || null;
        const a = now ? holdingAlert(t, now) : null;
        // 帳面賺賠扣掉買進手續費和現在賣掉要付的手續費，跟券商「投資損益」對得起來
        const bf = t.buyFee ?? buyFeeOf(market, t.code, t.price, t.shares);
        const net = now
          ? (now - t.price) * t.shares -
            bf -
            sellFeeOf(market, t.code, now, t.shares)
          : 0;
        return (
          <li
            key={t.code}
            className={`rounded-xl p-3 text-sm ${TONE[a?.tone ?? "plain"]}`}
          >
            <div className="flex flex-wrap items-baseline gap-x-3">
              <b className="text-base">
                {t.name} <span className="text-stone-500">{t.code}</span>
              </b>
              <span>
                {t.saved} 買 {fmt(t.shares, Number.isInteger(t.shares) ? 0 : 2)}{" "}
                股 @ {fmt(t.price, 2)}
              </span>
              {a && now && (
                <span
                  className={
                    net >= 0
                      ? "font-bold text-red-700 dark:text-red-400"
                      : "font-bold text-green-700 dark:text-green-400"
                  }
                >
                  現價 {fmt(now, 2)}，扣完手續費{net >= 0 ? "賺" : "賠"}{" "}
                  {fmt(Math.abs(net), us ? 2 : 0)} {us ? "美元" : "元"}（
                  {((net / (t.price * t.shares)) * 100).toFixed(1)}%）
                </span>
              )}
            </div>
            <p className="mt-1">
              {a ? a.text : err ? "現價暫時抓不到。" : "讀取現價中⋯⋯"}
              <span className="text-stone-500">
                　停損 {fmt(t.stop, 2)}・停利 {fmt(t.target, 2)}
              </span>
            </p>
            {selling === t.code ? (
              <SellForm
                buy={t.price}
                buyFee={bf}
                sellFeeAt={(p) => sellFeeOf(market, t.code, p, t.shares)}
                now={now}
                unit={us ? "美元" : "元"}
                onCancel={() => setSelling(null)}
                onSave={(sell, buy, date, buyFee, sellFee) => {
                  setJournal([
                    close({ ...t, buyFee }, market, sell, buy, date, sellFee),
                    ...journal,
                  ]);
                  setTrades(trades.filter((x) => x.code !== t.code));
                  setSelling(null);
                }}
              />
            ) : editing === t.code ? (
              <TradeEdit
                t={t}
                market={market}
                className="mt-2"
                onSave={(h) => {
                  setTrades(trades.map((x) => (x.code === t.code ? h : x)));
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <p className="mt-1 flex gap-4 text-xs font-bold text-[#1f2328] dark:text-[#e8edf3]">
                <button
                  onClick={() => setEditing(t.code)}
                  className="underline"
                >
                  修改股數、價格
                </button>
                <button
                  onClick={() => setSelling(t.code)}
                  className="underline"
                >
                  賣掉了，記進成績單
                </button>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// 賣掉後填實際成交價，買價也可以改成實際成交的（測試單常常跟小抄差一點）
function SellForm({
  buy,
  buyFee,
  sellFeeAt,
  now,
  unit,
  onCancel,
  onSave,
}: {
  buy: number;
  buyFee: number;
  sellFeeAt: (price: number) => number;
  now: number | null;
  unit: string;
  onCancel: () => void;
  onSave: (
    sell: number,
    buy: number,
    date: string,
    buyFee: number,
    sellFee: number,
  ) => void;
}) {
  const [sell, setSell] = useState(now ? String(now) : "");
  const [b, setB] = useState(String(buy));
  const [bf, setBf] = useState(String(buyFee));
  const [sf, setSf] = useState("");
  const [date, setDate] = useState(() => taipeiToday());
  const ok = Number(sell) > 0 && Number(b) > 0;
  const input =
    "w-28 rounded-lg border-2 border-stone-200 bg-white px-2 py-1 dark:border-stone-700 dark:bg-stone-900";
  return (
    <div className="mt-2 flex flex-wrap items-end gap-2 text-xs">
      <label className="grid gap-0.5">
        實際賣出價（{unit}）
        <input
          id="sell-price"
          inputMode="decimal"
          value={sell}
          onChange={(e) => setSell(e.target.value)}
          className={input}
        />
      </label>
      <label className="grid gap-0.5">
        實際買進價
        <input
          id="buy-price"
          inputMode="decimal"
          value={b}
          onChange={(e) => setB(e.target.value)}
          className={input}
        />
      </label>
      <label className="grid gap-0.5">
        買進手續費
        <input
          inputMode="decimal"
          value={bf}
          onChange={(e) => setBf(e.target.value)}
          placeholder="0"
          className={input}
        />
      </label>
      <label className="grid gap-0.5">
        賣出手續費
        <input
          inputMode="decimal"
          value={sf}
          onChange={(e) => setSf(e.target.value)}
          placeholder={
            Number(sell) > 0 ? `自動算 ${fmt(sellFeeAt(Number(sell)), 2)}` : ""
          }
          className={input}
        />
      </label>
      <label className="grid gap-0.5">
        賣出日
        <input
          id="sell-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={input}
        />
      </label>
      <button
        disabled={!ok}
        onClick={() =>
          onSave(
            Number(sell),
            Number(b),
            date,
            Number(bf) || 0,
            sf.trim() === "" ? sellFeeAt(Number(sell)) : Number(sf),
          )
        }
        className="rounded-full bg-[#1f2328] px-3 py-1 font-bold text-white dark:bg-[#e8edf3] dark:text-[#1f2328] disabled:opacity-40"
      >
        記下來
      </button>
      <button onClick={onCancel} className="text-stone-500 underline">
        取消
      </button>
    </div>
  );
}
