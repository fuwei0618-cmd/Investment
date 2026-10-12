"use client";

import { usePersistentState } from "@/lib/storage";
import { CHECKLIST } from "@/lib/compassData";
import Terms from "@/components/Terms";

export default function WinnerChecklist() {
  const [state, setState] = usePersistentState<{ name: string; checks: Record<string, boolean> }>(
    "compass.stock.v1",
    { name: "", checks: {} },
  );
  const groups = [...new Set(CHECKLIST.map((c) => c.group))];
  const passed = CHECKLIST.filter((c) => state.checks[c.key]).length;
  return (
    <div data-tour="checklist" className="space-y-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="shrink-0">公司</span>
        <input
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
          placeholder="例如 台積電"
          className="w-full rounded-md border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
        />
      </label>
      <div className="flex items-center gap-2 rounded-md bg-amber-50 p-2 text-xs dark:bg-amber-950">
        <span className="flex-1">不知道怎麼查這些數字？讓 AI 先幫你看一遍，再自己打勾。</span>
        <button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("ask-prefill", {
                detail: `用贏家清單幫我檢查${state.name || "（公司名稱）"}：產業成長、主要客戶、營收、賺錢的產品、毛利率、市佔率、獲利成長、護城河、存貨、負債、現金流、股價貴不貴，各項大概過不過關？`,
              }),
            )
          }
          className="shrink-0 rounded-full bg-amber-400 px-3 py-1 font-medium text-zinc-900"
        >
          問 AI
        </button>
      </div>
      {groups.map((g) => (
        <fieldset key={g}>
          <legend className="mb-1 font-medium">{g}</legend>
          {CHECKLIST.filter((c) => c.group === g).map((c) => (
            <label key={c.key} className="flex gap-2 py-1">
              <input
                type="checkbox"
                checked={!!state.checks[c.key]}
                onChange={(e) => setState({ ...state, checks: { ...state.checks, [c.key]: e.target.checked } })}
                className="mt-1"
              />
              <span>
                {c.label}
                <span className="block text-xs text-zinc-500">
                  專業說法：<Terms text={c.rule} />
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      ))}
      <p className="rounded-md bg-zinc-100 p-2 dark:bg-zinc-800">
        {state.name || "這家公司"}符合 {passed} / {CHECKLIST.length} 項。符合越多，越可能是贏勢股；風險項沒打勾就先查清楚原因。
      </p>
    </div>
  );
}
