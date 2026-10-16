"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Live } from "@/lib/dayTrade";
import { holdingAlert, type Holding } from "@/lib/desk";
import { fmt, usePersistentState } from "@/lib/storage";

const TONE = {
  red: "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100",
  green:
    "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  plain: "bg-[#f3ead8] dark:bg-[#2f281f]",
};

// 我的持股提醒：讀「帶我做」第六步記下來的單子，拿現價比停損停利
export default function Holdings({ market = "tw" }: { market?: "tw" | "us" }) {
  const us = market === "us";
  const [trades, , loaded] = usePersistentState<Holding[]>(
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
                {t.saved} 買 {fmt(t.shares)} 股 @ {fmt(t.price, 2)}
              </span>
              {a && now && (
                <span
                  className={
                    a.pnl >= 0
                      ? "font-bold text-red-700 dark:text-red-400"
                      : "font-bold text-green-700 dark:text-green-400"
                  }
                >
                  現價 {fmt(now, 2)}，{a.pnl >= 0 ? "賺" : "賠"}{" "}
                  {fmt(Math.abs(a.pnl))} {us ? "美元" : "元"}（
                  {(a.pct * 100).toFixed(1)}%）
                </span>
              )}
            </div>
            <p className="mt-1">
              {a ? a.text : err ? "現價暫時抓不到。" : "讀取現價中⋯⋯"}
              <span className="text-stone-500">
                　停損 {t.stop}・停利 {t.target}
              </span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
