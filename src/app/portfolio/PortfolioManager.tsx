"use client";

import { useMemo, useState } from "react";
import {
  ASSET_CLASS_LABEL,
  AssetClass,
  CONCENTRATION_LIMIT,
  DEFENSIVE,
  Market,
  Trade,
  buildPositions,
  suggestedRiskRatio,
} from "@/lib/portfolio";
import { fmt, pct, usePersistentState } from "@/lib/storage";

interface PriceInfo {
  price: number;
  date: string;
}

interface Settings {
  usdTwd: number;
  age: number;
  targetRisk: number | null; // null = 依年齡建議
}

const EMPTY_TRADE = {
  date: new Date().toISOString().slice(0, 10),
  market: "TW" as Market,
  symbol: "",
  name: "",
  side: "buy" as const,
  price: 0,
  qty: 0,
  fee: 0,
  assetClass: "stock" as AssetClass,
  reason: "",
};

export default function PortfolioManager() {
  const [trades, setTrades] = usePersistentState<Trade[]>("portfolio.trades.v1", []);
  const [prices, setPrices] = usePersistentState<Record<string, PriceInfo>>("portfolio.prices.v1", {});
  const [settings, setSettings] = usePersistentState<Settings>("portfolio.settings.v1", {
    usdTwd: 32,
    age: 30,
    targetRisk: null,
  });
  const [draft, setDraft] = useState<Omit<Trade, "id"> & { side: "buy" | "sell" }>(EMPTY_TRADE);
  const [status, setStatus] = useState("");

  const positions = useMemo(() => buildPositions(trades).filter((p) => p.qty > 0 || p.realized !== 0), [trades]);
  const fx = (m: Market) => (m === "US" ? settings.usdTwd : 1);

  const rows = positions.map((p) => {
    const key = `${p.market}:${p.symbol}`;
    const price = prices[key]?.price ?? p.avgCost;
    const value = p.qty * price * fx(p.market);
    const cost = p.qty * p.avgCost * fx(p.market);
    return { ...p, key, price, priceDate: prices[key]?.date, value, cost, unrealized: value - cost };
  });
  const total = rows.reduce((s, r) => s + r.value, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const realized = rows.reduce((s, r) => s + r.realized * fx(r.market), 0);
  const defensive = rows.filter((r) => DEFENSIVE.includes(r.assetClass)).reduce((s, r) => s + r.value, 0);
  const riskRatio = total > 0 ? (total - defensive) / total : null;
  const target = settings.targetRisk ?? suggestedRiskRatio(settings.age);
  const concentrated = rows.filter((r) => total > 0 && r.value / total > CONCENTRATION_LIMIT);

  const byClass = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.assetClass] = (acc[r.assetClass] ?? 0) + r.value;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  async function refreshPrices() {
    setStatus("更新報價中…");
    const next = { ...prices };
    const errors: string[] = [];
    for (const r of rows.filter((r) => r.qty > 0 && r.assetClass !== "cash")) {
      try {
        const res = await fetch(`/api/quote?market=${r.market}&symbol=${encodeURIComponent(r.symbol)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        next[r.key] = { price: json.price, date: json.date };
      } catch (e) {
        errors.push(`${r.symbol}：${e instanceof Error ? e.message : "失敗"}`);
      }
    }
    setPrices(next);
    setStatus(errors.length ? `部分失敗，可手動輸入價格。${errors.join("；")}` : "報價已更新");
  }

  function addTrade() {
    if (!draft.symbol || draft.qty <= 0 || draft.price < 0) {
      setStatus("請填代號、數量與價格");
      return;
    }
    setTrades([...trades, { ...draft, symbol: draft.symbol.toUpperCase(), id: crypto.randomUUID() }]);
    setDraft({ ...EMPTY_TRADE, date: draft.date, market: draft.market });
    setStatus("");
  }

  function exportCsv() {
    const head = "日期,買賣,市場,代碼,名稱,價格,數量,手續費,資產類別,理由";
    const lines = trades.map((t) =>
      [t.date, t.side === "buy" ? "Buy" : "Sell", t.market, t.symbol, t.name, t.price, t.qty, t.fee, t.assetClass, t.reason]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob(["﻿" + [head, ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `交易紀錄-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="總市值（台幣）" value={fmt(total)} />
        <Stat
          label="未實現損益"
          value={`${fmt(total - totalCost)}（${pct(totalCost ? (total - totalCost) / totalCost : null)}）`}
          tone={total - totalCost >= 0 ? "good" : "bad"}
        />
        <Stat label="已實現損益" value={fmt(realized)} tone={realized >= 0 ? "good" : "bad"} />
        <Stat
          label={`高風險:防禦（目標 ${Math.round(target * 100)}:${Math.round((1 - target) * 100)}）`}
          value={riskRatio === null ? "—" : `${Math.round(riskRatio * 100)}:${Math.round((1 - riskRatio) * 100)}`}
        />
      </section>

      {(concentrated.length > 0 || (riskRatio !== null && Math.abs(riskRatio - target) >= 0.05)) && (
        <section className="space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950">
          {concentrated.map((r) => (
            <p key={r.key}>
              ⚠ {r.symbol} 占總資產 {pct(r.value / total)}，超過 20% 集中度上限（CodeGym 9-1）。
            </p>
          ))}
          {riskRatio !== null && Math.abs(riskRatio - target) >= 0.05 && (
            <p>
              ⚠ 高風險資產 {pct(riskRatio, 0)}，偏離目標 {pct(target, 0)}。課程建議每年固定再平衡一次，配合投入新資金時調整（王伯達
              4-3）。
            </p>
          )}
        </section>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <h2 className="mr-auto font-medium">持股</h2>
          <label className="flex items-center gap-1">
            美元匯率
            <input
              className="w-20"
              type="number"
              step="any"
              value={settings.usdTwd}
              onChange={(e) => setSettings({ ...settings, usdTwd: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center gap-1">
            年齡
            <input
              className="w-16"
              type="number"
              value={settings.age}
              onChange={(e) => setSettings({ ...settings, age: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center gap-1">
            目標高風險 %
            <input
              className="w-16"
              type="number"
              placeholder={String(Math.round(suggestedRiskRatio(settings.age) * 100))}
              value={settings.targetRisk === null ? "" : Math.round(settings.targetRisk * 100)}
              onChange={(e) =>
                setSettings({ ...settings, targetRisk: e.target.value === "" ? null : Number(e.target.value) / 100 })
              }
            />
          </label>
          <button onClick={refreshPrices} className="rounded-md bg-zinc-900 px-3 py-1.5 text-white dark:bg-zinc-100 dark:text-zinc-900">
            更新報價
          </button>
        </div>
        {status && <p className="mb-2 text-sm text-zinc-500">{status}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm tabular-nums">
            <thead className="text-zinc-500">
              <tr>
                {["代號", "類別", "股數", "均價", "現價", "市值(台幣)", "損益", "占比"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-1 font-normal first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.filter((r) => r.qty > 0).map((r) => (
                <tr key={r.key} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-2 py-1 text-left">
                    <div>{r.symbol}</div>
                    <div className="text-xs text-zinc-500">
                      {r.market}
                      {r.name && `・${r.name}`}
                    </div>
                  </td>
                  <td className="px-2 py-1">{ASSET_CLASS_LABEL[r.assetClass]}</td>
                  <td className="px-2 py-1">{fmt(r.qty)}</td>
                  <td className="px-2 py-1">{fmt(r.avgCost, 2)}</td>
                  <td className="px-2 py-1">
                    <input
                      className="w-24 text-right"
                      type="number"
                      step="any"
                      value={r.price}
                      title={r.priceDate ? `報價日 ${r.priceDate}` : "尚未取得報價，暫用均價"}
                      onChange={(e) =>
                        setPrices({ ...prices, [r.key]: { price: Number(e.target.value), date: "手動" } })
                      }
                    />
                  </td>
                  <td className="px-2 py-1">{fmt(r.value)}</td>
                  <td className={`px-2 py-1 ${r.unrealized >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {fmt(r.unrealized)}
                  </td>
                  <td className="px-2 py-1">{pct(total ? r.value / total : null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">還沒有交易，從下方新增第一筆。</p>}
        </div>
        {byClass.length > 0 && (
          <div className="mt-4">
            <div className="flex h-3 overflow-hidden rounded-full">
              {byClass.map(([c, v], i) => (
                <div
                  key={c}
                  style={{ width: `${(v / total) * 100}%` }}
                  className={["bg-blue-600", "bg-teal-500", "bg-amber-500", "bg-zinc-400", "bg-rose-500", "bg-violet-500"][i % 6]}
                />
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
              {byClass.map(([c, v]) => (
                <span key={c}>
                  {ASSET_CLASS_LABEL[c as AssetClass]} {pct(v / total)}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 font-medium">新增交易</h2>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <Field label="日期">
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </Field>
          <Field label="市場">
            <select value={draft.market} onChange={(e) => setDraft({ ...draft, market: e.target.value as Market })}>
              <option value="TW">台股</option>
              <option value="US">美股</option>
            </select>
          </Field>
          <Field label="買賣">
            <select value={draft.side} onChange={(e) => setDraft({ ...draft, side: e.target.value as "buy" | "sell" })}>
              <option value="buy">買進</option>
              <option value="sell">賣出</option>
            </select>
          </Field>
          <Field label="代號">
            <input value={draft.symbol} placeholder="0050 / VT" onChange={(e) => setDraft({ ...draft, symbol: e.target.value })} />
          </Field>
          <Field label="名稱">
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="資產類別">
            <select value={draft.assetClass} onChange={(e) => setDraft({ ...draft, assetClass: e.target.value as AssetClass })}>
              {Object.entries(ASSET_CLASS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="價格（原幣）">
            <input type="number" step="any" value={draft.price || ""} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
          </Field>
          <Field label="數量（股）">
            <input type="number" step="any" value={draft.qty || ""} onChange={(e) => setDraft({ ...draft, qty: Number(e.target.value) })} />
          </Field>
          <Field label="手續費＋稅（原幣）">
            <input type="number" step="any" value={draft.fee || ""} onChange={(e) => setDraft({ ...draft, fee: Number(e.target.value) })} />
          </Field>
          <Field label="交易理由">
            <input value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} />
          </Field>
        </div>
        <button onClick={addTrade} className="mt-3 rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white">
          新增
        </button>
      </section>

      {trades.length > 0 && (
        <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center">
            <h2 className="mr-auto font-medium">交易紀錄</h2>
            <button onClick={exportCsv} className="text-sm text-blue-600">
              匯出 CSV
            </button>
          </div>
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {[...trades].reverse().map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2 py-1.5">
                <span className="text-zinc-500">{t.date}</span>
                <span className={t.side === "buy" ? "text-emerald-600" : "text-red-600"}>
                  {t.side === "buy" ? "買" : "賣"}
                </span>
                <span>
                  {t.symbol} {fmt(t.qty)} 股 @ {fmt(t.price, 2)}
                </span>
                {t.reason && <span className="text-zinc-500">・{t.reason}</span>}
                <button className="ml-auto text-red-600" onClick={() => setTrades(trades.filter((x) => x.id !== t.id))}>
                  刪除
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  const color = tone === "good" ? "text-emerald-600 dark:text-emerald-400" : tone === "bad" ? "text-red-600" : "";
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
