"use client";

import { usePersistentState, fmt } from "@/lib/storage";
import { METHOD_LABEL, decide, pickMethod } from "@/lib/compass";

interface Inputs {
  profitable3y: boolean;
  assetBased: boolean;
  revenueGrowth: number;
  perShare: number;
  multiple: number;
  price: number;
  expected: number;
}

const DEFAULTS: Inputs = {
  profitable3y: true,
  assetBased: false,
  revenueGrowth: 10,
  perShare: 6.9,
  multiple: 25,
  price: 120,
  expected: 20,
};

const VERDICT = {
  buy: { text: "買進", cls: "text-emerald-600 dark:text-emerald-400" },
  hold: { text: "中立", cls: "text-zinc-600" },
  sell: { text: "不買（持有者賣出）", cls: "text-red-600" },
} as const;

function Num({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-right tabular-nums dark:border-zinc-700"
      />
    </label>
  );
}

export default function ValuationCalc() {
  const [v, setV] = usePersistentState<Inputs>("compass.valuation.v1", DEFAULTS);
  const set = (patch: Partial<Inputs>) => setV({ ...v, ...patch });
  const method = pickMethod(v);
  const label = METHOD_LABEL[method];
  const target = v.perShare * v.multiple;
  const ok = v.price > 0 && target > 0;
  const result = ok ? decide(target, v.price, v.expected) : null;
  return (
    <div data-tour="valuation" className="space-y-4 text-sm">
      <div className="space-y-2">
        <p className="font-medium">1. 這家公司是哪一種？</p>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={v.profitable3y} onChange={(e) => set({ profitable3y: e.target.checked })} />
          最近三年每年都賺錢
        </label>
        {v.profitable3y ? (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={v.assetBased} onChange={(e) => set({ assetBased: e.target.checked })} />
            價值主要來自資產（金融、營建這類）
          </label>
        ) : (
          <Num label="營收年成長率 %" value={v.revenueGrowth} onChange={(n) => set({ revenueGrowth: n })} />
        )}
        <p>
          → 用<strong className="mx-1">{label.name}</strong>估價
        </p>
      </div>
      <div className="space-y-2">
        <p className="font-medium">2. 算目標價</p>
        <Num label={label.perShare} value={v.perShare} onChange={(n) => set({ perShare: n })} />
        <Num label={label.multiple} value={v.multiple} onChange={(n) => set({ multiple: n })} />
        <p>
          目標價 = {fmt(v.perShare, 2)} × {fmt(v.multiple, 1)} = <strong>{fmt(target, 1)}</strong>
        </p>
      </div>
      <div className="space-y-2">
        <p className="font-medium">3. 決定買進賣出（第 8 步）</p>
        <Num label="現在股價" value={v.price} onChange={(n) => set({ price: n })} />
        <Num label="你想要的報酬率 %" value={v.expected} onChange={(n) => set({ expected: n })} />
        {result && (
          <p className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-800">
            潛在報酬 {fmt(target, 1)} ÷ {fmt(v.price, 1)} − 1 = {fmt(result.upside, 1)}%，
            {result.upside > v.expected ? "高於" : result.upside < v.expected ? "低於" : "等於"}你要的 {fmt(v.expected, 1)}% →{" "}
            <strong className={VERDICT[result.verdict].cls}>{VERDICT[result.verdict].text}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
