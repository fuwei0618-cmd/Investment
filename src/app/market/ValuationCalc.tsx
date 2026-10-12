"use client";

import { usePersistentState, fmt } from "@/lib/storage";
import { METHOD_LABEL, decide, pickMethod } from "@/lib/compass";
import Terms, { Term } from "@/components/Terms";

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

function Num({ label, value, onChange }: { label: React.ReactNode; value: number; onChange: (n: number) => void }) {
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

// 帶著第 6 關填的公司名，請最上面的 AI 查估價要用的數字。
function askNumbers(perShare: string, multiple: string) {
  let name = "";
  try {
    name = JSON.parse(localStorage.getItem("compass.stock.v1") ?? "{}").name ?? "";
  } catch {}
  window.dispatchEvent(
    new CustomEvent("ask-prefill", {
      detail: `${name || "（公司名稱）"}的${perShare}大概多少？${multiple}過去平常落在什麼範圍、現在算貴還是便宜？`,
    }),
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
          → 用「<strong>
            <Term term={label.name} />
          </strong>」這把尺估價
        </p>
      </div>
      <div className="space-y-2">
        <p className="font-medium">2. 算目標價</p>
        <Num label={<Terms text={label.perShare} />} value={v.perShare} onChange={(n) => set({ perShare: n })} />
        <Num label={<Terms text={label.multiple} />} value={v.multiple} onChange={(n) => set({ multiple: n })} />
        <div className="flex items-center gap-2 rounded-md bg-amber-50 p-2 text-xs dark:bg-amber-950">
          <span className="flex-1">不知道這兩個數字去哪找？讓 AI 先查一個大概。</span>
          <button onClick={() => askNumbers(label.perShare, label.multiple)} className="shrink-0 rounded-full bg-amber-400 px-3 py-1 font-medium text-zinc-900">
            問 AI
          </button>
        </div>
        <p>
          <Term term="目標價" /> = {fmt(v.perShare, 2)} × {fmt(v.multiple, 1)} = <strong>{fmt(target, 1)}</strong>
        </p>
      </div>
      <div className="space-y-2">
        <p className="font-medium">3. 決定買進賣出（第 8 步）</p>
        <Num label="現在股價" value={v.price} onChange={(n) => set({ price: n })} />
        <Num label={<><Term term="預期報酬率">你想要的報酬率</Term> %</>} value={v.expected} onChange={(n) => set({ expected: n })} />
        {result && (
          <p className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-800">
            <Term term="潛在報酬率">潛在報酬</Term> {fmt(target, 1)} ÷ {fmt(v.price, 1)} − 1 = {fmt(result.upside, 1)}%，
            {result.upside > v.expected ? "高於" : result.upside < v.expected ? "低於" : "等於"}你要的 {fmt(v.expected, 1)}% →{" "}
            <strong className={VERDICT[result.verdict].cls}>{VERDICT[result.verdict].text}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
