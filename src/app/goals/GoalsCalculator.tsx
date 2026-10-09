"use client";

import { useMemo } from "react";
import { DEFAULT_INPUTS, GoalInputs, simulate } from "@/lib/goals";
import { fmt, pct, usePersistentState } from "@/lib/storage";

type NumKey = { [K in keyof GoalInputs]: GoalInputs[K] extends number ? K : never }[keyof GoalInputs];

const FIELDS: { key: NumKey; label: string; percent?: boolean }[] = [
  { key: "currentAge", label: "目前年齡" },
  { key: "retireAge", label: "退休年齡" },
  { key: "lifeExpectancy", label: "預期壽命" },
  { key: "annualSalary", label: "年薪" },
  { key: "salaryGrowth", label: "薪資成長率", percent: true },
  { key: "salaryPeakAge", label: "薪資停止成長年齡" },
  { key: "savings", label: "目前可投資資產" },
  { key: "returnRate", label: "預期年報酬率", percent: true },
  { key: "monthlyLiving", label: "每月生活費" },
  { key: "inflation", label: "生活費通膨", percent: true },
  { key: "monthlyRent", label: "每月房租（買房前）" },
  { key: "houseAge", label: "購屋年齡" },
  { key: "housePrice", label: "房價" },
  { key: "downPaymentRatio", label: "頭期款比例", percent: true },
  { key: "mortgageRate", label: "房貸利率", percent: true },
  { key: "mortgageYears", label: "房貸年數" },
];

export default function GoalsCalculator() {
  const [inp, setInp] = usePersistentState<GoalInputs>("goals.v1", DEFAULT_INPUTS);
  const result = useMemo(() => simulate(inp), [inp]);

  const set = (key: NumKey, raw: string, percent?: boolean) => {
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    setInp({ ...inp, [key]: percent ? n / 100 : n });
  };

  const okWithdrawal = result.firstYearWithdrawalRate !== null && result.firstYearWithdrawalRate <= 0.04;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="退休時累積資產" value={fmt(result.balanceAtRetire)} />
        <Stat label="退休所需資產（年支出 × 25）" value={fmt(result.retireNeed)} />
        <Stat
          label="退休首年提領率（目標 ≤ 4%）"
          value={pct(result.firstYearWithdrawalRate)}
          tone={okWithdrawal ? "good" : "bad"}
        />
        <Stat
          label="累積結存轉負年齡"
          value={result.negativeAge === null ? "不會轉負" : `${result.negativeAge} 歲`}
          tone={result.negativeAge === null ? "good" : "bad"}
        />
      </section>

      <BalanceChart rows={result.rows} retireAge={inp.retireAge} />

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 font-medium">輸入條件</h2>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="text-zinc-500">
                {f.label}
                {f.percent ? "（%）" : ""}
              </span>
              <input
                type="number"
                step="any"
                value={f.percent ? +(inp[f.key] * 100).toFixed(4) : inp[f.key]}
                onChange={(e) => set(f.key, e.target.value, f.percent)}
              />
            </label>
          ))}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inp.buyHouse}
              onChange={(e) => setInp({ ...inp, buyHouse: e.target.checked })}
            />
            <span>要買房</span>
          </label>
        </div>

        <h3 className="mb-2 mt-4 text-sm font-medium">其他大額支出（結婚、小孩、買車…）</h3>
        <div className="space-y-2 text-sm">
          {inp.lumpExpenses.map((e, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                className="w-28"
                value={e.label}
                onChange={(ev) => updateLump(i, { label: ev.target.value })}
              />
              <input
                className="w-20"
                type="number"
                value={e.age}
                onChange={(ev) => updateLump(i, { age: Number(ev.target.value) })}
              />
              <span>歲</span>
              <input
                className="w-32"
                type="number"
                value={e.amount}
                onChange={(ev) => updateLump(i, { amount: Number(ev.target.value) })}
              />
              <span>元</span>
              <button
                className="text-red-600"
                onClick={() =>
                  setInp({ ...inp, lumpExpenses: inp.lumpExpenses.filter((_, j) => j !== i) })
                }
              >
                刪除
              </button>
            </div>
          ))}
          <div className="flex gap-3">
            <button
              className="text-blue-600"
              onClick={() =>
                setInp({
                  ...inp,
                  lumpExpenses: [...inp.lumpExpenses, { age: inp.currentAge + 5, amount: 0, label: "支出" }],
                })
              }
            >
              ＋ 新增
            </button>
            <button className="text-zinc-500" onClick={() => setInp(DEFAULT_INPUTS)}>
              恢復課程範例
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-right text-sm tabular-nums">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800">
            <tr>
              {["年齡", "薪資", "投資收入", "生活費", "居住", "其他", "結餘", "累積結存", "儲蓄率", "提領率"].map(
                (h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-2 font-normal">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr
                key={r.age}
                className={`border-t border-zinc-100 dark:border-zinc-800 ${r.balance < 0 ? "text-red-600" : ""}`}
              >
                <td className="px-2 py-1">{r.age}</td>
                <td className="px-2 py-1">{fmt(r.salary)}</td>
                <td className="px-2 py-1">{fmt(r.investIncome)}</td>
                <td className="px-2 py-1">{fmt(r.living)}</td>
                <td className="px-2 py-1">{fmt(r.housing)}</td>
                <td className="px-2 py-1">{fmt(r.other)}</td>
                <td className="px-2 py-1">{fmt(r.net)}</td>
                <td className="px-2 py-1">{fmt(r.balance)}</td>
                <td className="px-2 py-1">{pct(r.savingsRate)}</td>
                <td className="px-2 py-1">{pct(r.withdrawalRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );

  function updateLump(i: number, patch: Partial<GoalInputs["lumpExpenses"][number]>) {
    setInp({
      ...inp,
      lumpExpenses: inp.lumpExpenses.map((e, j) => (j === i ? { ...e, ...patch } : e)),
    });
  }
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  const color =
    tone === "good" ? "text-emerald-600 dark:text-emerald-400" : tone === "bad" ? "text-red-600" : "";
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function BalanceChart({ rows, retireAge }: { rows: { age: number; balance: number }[]; retireAge: number }) {
  const W = 600;
  const H = 180;
  const min = Math.min(0, ...rows.map((r) => r.balance));
  const max = Math.max(1, ...rows.map((r) => r.balance));
  const x = (i: number) => (i / Math.max(1, rows.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const path = rows.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r.balance).toFixed(1)}`).join("");
  const retireIdx = rows.findIndex((r) => r.age === retireAge);
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-2 text-sm text-zinc-500">累積結存走勢（萬元）</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" preserveAspectRatio="none">
        <line x1={0} x2={W} y1={y(0)} y2={y(0)} className="stroke-zinc-300 dark:stroke-zinc-700" />
        {retireIdx >= 0 && (
          <line
            x1={x(retireIdx)}
            x2={x(retireIdx)}
            y1={0}
            y2={H}
            strokeDasharray="4 4"
            className="stroke-zinc-400"
          />
        )}
        <path d={path} fill="none" strokeWidth={2} className="stroke-blue-600" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{rows[0]?.age} 歲</span>
        <span>最高 {fmt(max / 10_000)} 萬・虛線為退休</span>
        <span>{rows.at(-1)?.age} 歲</span>
      </div>
    </section>
  );
}
