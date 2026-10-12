import Link from "next/link";
import { Suspense } from "react";
import CourseRefs from "@/components/CourseRefs";
import { getSeries } from "@/lib/fred";
import { FRED_VIEW, estimatePhase, yoyPct } from "@/lib/compass";
import { COMPASS_STEPS, CompassStep, FAIR_MULTIPLE, LIFECYCLE, WatchItem } from "@/lib/compassData";
import { findModule, moduleLabel } from "@/lib/modules";
import QuadrantPicker from "./QuadrantPicker";
import SectorsByNeed from "./SectorsByNeed";
import WinnerChecklist from "./WinnerChecklist";
import ValuationCalc from "./ValuationCalc";

const STAGES = [
  { key: "macro", name: "總經", steps: [1, 2, 3], plain: "先看世界景氣與錢的鬆緊" },
  { key: "industry", name: "產業", steps: [4, 5], plain: "再挑順風、有前途的產業" },
  { key: "stock", name: "個股", steps: [6, 7, 8], plain: "最後挑公司、算價格、決定買賣" },
] as const;

async function LiveValue({ id }: { id: string }) {
  const view = FRED_VIEW[id];
  const series = view ? await getSeries(id) : null;
  const v = series ? view.calc(series) : null;
  if (v === null || !series) return <span className="text-xs text-zinc-400">暫時取不到資料</span>;
  return (
    <span className="text-xs">
      現在{view.label} <strong className="text-sm tabular-nums">{v.toFixed(2)}</strong>
      {view.unit}
      <span className="ml-1 text-zinc-400">（{series.at(-1)!.date}）</span>
    </span>
  );
}

async function Quadrant() {
  const [gdp, cpi] = await Promise.all([getSeries("GDPC1"), getSeries("CPIAUCSL")]);
  const g = gdp ? yoyPct(gdp) : null;
  const c = cpi ? yoyPct(cpi) : null;
  const auto = g !== null && c !== null ? estimatePhase(g, c) : null;
  return <QuadrantPicker auto={auto} growth={g} inflation={c} />;
}

function Watch({ w }: { w: WatchItem }) {
  return (
    <li className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="font-medium">{w.name}</span>
        {w.fred && (
          <Suspense fallback={<span className="text-xs text-zinc-400">讀取中…</span>}>
            <LiveValue id={w.fred} />
          </Suspense>
        )}
      </div>
      <p className="text-zinc-600 dark:text-zinc-400">{w.plain}</p>
      <p className="mt-1">怎麼看：{w.rule}</p>
      {w.source && <p className="text-xs text-zinc-500">去哪找：{w.source}</p>}
    </li>
  );
}

function Tool({ step }: { step: number }) {
  switch (step) {
    case 3:
      return (
        <Suspense fallback={<p className="text-zinc-500">讀取中…</p>}>
          <Quadrant />
        </Suspense>
      );
    case 4:
      return <SectorsByNeed />;
    case 5:
      return (
        <div className="space-y-2">
          <p className="font-medium">產業也有生老病死</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {LIFECYCLE.map((l) => (
              <li key={l.stage} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <span className="font-medium">{l.stage}</span>
                <span className="ml-2 text-xs text-zinc-500">{l.examples}</span>
                <p className="text-zinc-600 dark:text-zinc-400">{l.plain}</p>
                <p>投資人：{l.investor}</p>
              </li>
            ))}
          </ul>
          <p>
            三項要領的檢核表在
            <Link href="/industry" className="mx-1 text-blue-600">
              第 1 章 產業脈絡
            </Link>
            ，可以替你關心的產業打分數。
          </p>
        </div>
      );
    case 6:
      return <WinnerChecklist />;
    case 7:
      return (
        <div className="space-y-3">
          <ValuationCalc />
          <div>
            <p className="font-medium">合理倍數怎麼抓</p>
            <ul className="list-inside list-disc text-zinc-600 dark:text-zinc-400">
              {FAIR_MULTIPLE.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function Step({ s }: { s: CompassStep }) {
  const m = findModule(s.module)!;
  return (
    <section id={`step-${s.step}`} className="scroll-mt-4 space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 font-semibold text-zinc-900">
          {s.step}
        </span>
        <div>
          <h2 className="text-lg font-semibold">{s.title}</h2>
          <p className="text-zinc-600 dark:text-zinc-400">{s.plain}</p>
        </div>
      </header>
      <p className="text-sm">{s.why}</p>
      {s.watch.length > 0 && (
        <div className="space-y-2 text-sm">
          <h3 className="font-medium">看這些數字</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {s.watch.map((w) => (
              <Watch key={w.name} w={w} />
            ))}
          </ul>
        </div>
      )}
      <div className="text-sm">
        <h3 className="font-medium">所以怎麼做</h3>
        <ul className="list-inside list-disc">
          {s.decide.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
      {s.step !== 8 && (
        <div className="text-sm">
          <Tool step={s.step} />
        </div>
      )}
      <p className="rounded-md bg-amber-50 p-2 text-sm dark:bg-amber-950">課程案例：{s.example}</p>
      <p className="text-xs text-zinc-500">
        總經X產業X個股 {s.units.join("、")}・工具在
        <Link href={`/${m.slug}`} className="ml-1 text-blue-600">
          {moduleLabel(m)} {m.title}
        </Link>
      </p>
    </section>
  );
}

export default function CompassPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-zinc-500">投資主線</p>
        <h1 className="text-2xl font-semibold">動態投資思維羅盤</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          M平方〈總經X產業X個股〉的 8 個步驟，由大到小：先看世界，再挑產業，最後挑公司。每一步都寫成白話，附上現在的數字和可以動手的小工具。看不懂的地方先跳過，照順序走一遍就有輪廓。
        </p>
        <nav className="grid gap-2 sm:grid-cols-3">
          {STAGES.map((g) => (
            <div key={g.key} className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-medium">{g.name}</p>
              <p className="text-zinc-500">{g.plain}</p>
              <p className="mt-1 flex flex-wrap gap-1">
                {g.steps.map((n) => (
                  <a key={n} href={`#step-${n}`} className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                    {n}. {COMPASS_STEPS[n - 1].title}
                  </a>
                ))}
              </p>
            </div>
          ))}
        </nav>
      </header>
      {STAGES.map((g) => (
        <div key={g.key} className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-500">
            {g.name}・{g.plain}
          </h2>
          {COMPASS_STEPS.filter((s) => s.module === g.key).map((s) => (
            <Step key={s.step} s={s} />
          ))}
        </div>
      ))}
      <CourseRefs slug="compass" />
    </div>
  );
}
