"use client";

import { IndustryCheck, evaluateIndustry } from "@/lib/industry";
import { usePersistentState } from "@/lib/storage";

const blank = (): IndustryCheck => ({
  id: crypto.randomUUID(),
  name: "",
  growth: null,
  barriers: { material: false, tech: false, platform: false },
  top1: null,
  top3: null,
  note: "",
});

const num = (v: string) => (v === "" ? null : Number(v));

export default function IndustryChecklist() {
  const [items, setItems] = usePersistentState<IndustryCheck[]>("industry.checks.v1", []);
  const update = (id: string, patch: Partial<IndustryCheck>) =>
    setItems(items.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-medium">三大要領檢核</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          潛在市場：未來 3 年年均成長 &gt; 10%。進入門檻：關鍵材料、技術、平台具備其一。競爭態勢：獨佔（第一大 &gt; 50%）或寡占（前三大
          &gt; 50%）。三項都符合才是值得投資的產業。
        </p>
      </div>

      {items.map((c) => {
        const r = evaluateIndustry(c);
        return (
          <div
            key={c.id}
            className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="flex-1 text-base"
                placeholder="產業名稱，例如：AI 伺服器、碳化矽"
                value={c.name}
                onChange={(e) => update(c.id, { name: e.target.value })}
              />
              <span
                className={`rounded px-2 py-0.5 ${
                  r.passed === 3
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                符合 {r.passed} / 3
              </span>
              <button className="text-red-600" onClick={() => setItems(items.filter((x) => x.id !== c.id))}>
                刪除
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Criterion ok={r.market} title="① 潛在市場">
                <label className="flex items-center gap-1">
                  年均成長
                  <input
                    className="w-20"
                    type="number"
                    step="any"
                    value={c.growth ?? ""}
                    onChange={(e) => update(c.id, { growth: num(e.target.value) })}
                  />
                  %
                </label>
              </Criterion>
              <Criterion ok={r.barrier} title="② 進入門檻">
                {(
                  [
                    ["material", "關鍵材料"],
                    ["tech", "關鍵技術"],
                    ["platform", "關鍵平台"],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="mr-3 inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={c.barriers[k]}
                      onChange={(e) => update(c.id, { barriers: { ...c.barriers, [k]: e.target.checked } })}
                    />
                    {label}
                  </label>
                ))}
              </Criterion>
              <Criterion ok={r.competition} title={`③ 競爭態勢：${r.competitionLabel}`}>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1">
                    第一大
                    <input
                      className="w-16"
                      type="number"
                      value={c.top1 ?? ""}
                      onChange={(e) => update(c.id, { top1: num(e.target.value) })}
                    />
                    %
                  </label>
                  <label className="flex items-center gap-1">
                    前三大
                    <input
                      className="w-16"
                      type="number"
                      value={c.top3 ?? ""}
                      onChange={(e) => update(c.id, { top3: num(e.target.value) })}
                    />
                    %
                  </label>
                </div>
              </Criterion>
            </div>
            <input
              className="w-full"
              placeholder="筆記：龍頭公司、資料來源…"
              value={c.note}
              onChange={(e) => update(c.id, { note: e.target.value })}
            />
          </div>
        );
      })}

      <button onClick={() => setItems([...items, blank()])} className="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white">
        ＋ 新增產業
      </button>
    </section>
  );
}

function Criterion({ ok, title, children }: { ok: boolean; title: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-md border p-2 ${ok ? "border-emerald-500" : "border-zinc-200 dark:border-zinc-700"}`}>
      <div className={`mb-1 font-medium ${ok ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
        {ok ? "✓ " : ""}
        {title}
      </div>
      {children}
    </div>
  );
}
