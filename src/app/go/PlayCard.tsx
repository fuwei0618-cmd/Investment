import type { MainGuide } from "@/lib/otherPlays";

// 主策略說明卡：放在帶我做最上面，點開看三個條件為什麼、為什麼會賺、整個流程
export default function PlayCard({ guide: m }: { guide: MainGuide }) {
  return (
    <details className="group rounded-2xl border-2 border-[#b4651e] bg-white p-4 dark:bg-stone-900">
      <summary className="cursor-pointer list-none">
        <span className="text-xs font-bold text-[#b4651e]">策略說明卡</span>
        <b className="block text-lg">{m.name}</b>
        <span className="block text-sm">{m.idea}</span>
        <span className="mt-1 block text-xs text-stone-500 group-open:hidden">
          點開看：為什麼是這三個條件、為什麼會賺、整個流程 ▾
        </span>
      </summary>
      <div className="mt-3 space-y-4 text-sm">
        <section className="space-y-2">
          <h3 className="font-bold">一、為什麼是這三個條件？</h3>
          <ol className="space-y-2">
            {m.conditions.map((c, i) => (
              <li
                key={c.name}
                className="rounded-xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]"
              >
                <b>
                  {"①②③"[i]} {c.name}
                </b>
                <span className="block">{c.why}</span>
              </li>
            ))}
          </ol>
          <p>
            <b>三個一起看：</b>
            {m.together}
          </p>
        </section>
        <section className="space-y-1">
          <h3 className="font-bold">二、為什麼會賺錢？</h3>
          <p>{m.why}</p>
        </section>
        <section className="space-y-1">
          <h3 className="font-bold">
            三、操作流程（下面的「帶我做」就是照這個走）
          </h3>
          <ol className="list-decimal space-y-0.5 pl-5">
            {m.flow.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ol>
        </section>
        <section className="space-y-1">
          <h3 className="font-bold">四、什麼時候會賠？</h3>
          <p>{m.lose}</p>
        </section>
      </div>
    </details>
  );
}
