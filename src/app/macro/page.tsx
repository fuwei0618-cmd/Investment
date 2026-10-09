import { Suspense } from "react";
import { INDICATORS, MANUAL_CHARTS, applyTransform } from "@/lib/macro";
import { getSeries } from "@/lib/fred";
import PhasePicker from "./PhasePicker";
import Sparkline from "@/components/Sparkline";

async function Indicators() {
  const data = await Promise.all(INDICATORS.map((i) => getSeries(i.id)));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {INDICATORS.map((ind, idx) => {
        const raw = data[idx];
        const series = raw ? applyTransform(raw, ind.transform) : null;
        const latest = series?.at(-1);
        const verdict = latest ? ind.judge(latest.value) : null;
        const color =
          verdict?.signal === "warn"
            ? "text-red-600"
            : verdict?.signal === "ok"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-500";
        return (
          <div key={ind.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-medium">{ind.title}</h3>
              <span className="text-xs text-zinc-500">{ind.source}</span>
            </div>
            {latest && verdict ? (
              <>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums">{latest.value.toFixed(2)}</span>
                  <span className="text-sm text-zinc-500">{ind.unit}</span>
                  <span className={`ml-auto text-sm ${color}`}>{verdict.text}</span>
                </div>
                <Sparkline series={series!.slice(-260)} />
                <p className="text-xs text-zinc-500">資料日 {latest.date}・FRED {ind.id}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">暫時取不到資料</p>
            )}
            <p className="mt-2 text-sm">{ind.rule}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function MacroPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-zinc-500">步驟 3・M平方 總經 2-1、2-2、3-7、4-1；總經X產業X個股 2、5 章</p>
        <h1 className="text-2xl font-semibold">總經羅盤</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          M平方的研究核心是「循環為主、數據為輔」：先看景氣反轉指標，再判斷所在象限，最後決定資產配置。數據預設看年增率。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">景氣反轉指標</h2>
        <Suspense fallback={<p className="text-sm text-zinc-500">讀取指標中…</p>}>
          <Indicators />
        </Suspense>
        <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm dark:border-zinc-700">
          <p className="mb-1 font-medium">十張圖中尚待接資料的項目</p>
          <ul className="list-inside list-disc text-zinc-600 dark:text-zinc-400">
            {MANUAL_CHARTS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">景氣象限與資產配置</h2>
        <PhasePicker />
      </section>
    </div>
  );
}
