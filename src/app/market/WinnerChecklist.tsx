"use client";

import { usePersistentState } from "@/lib/storage";
import { CHECKLIST } from "@/lib/compassData";

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
                <span className="block text-xs text-zinc-500">{c.rule}</span>
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
