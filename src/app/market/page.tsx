import Link from "next/link";
import { Suspense } from "react";
import CourseRefs from "@/components/CourseRefs";
import LightDot from "@/components/Light";
import { getSeries } from "@/lib/fred";
import { FRED_VIEW } from "@/lib/compass";
import { COMPASS_STEPS, CompassStep, FAIR_MULTIPLE, LIFECYCLE, WatchItem } from "@/lib/compassData";
import { getTodayAnswers } from "@/lib/todayData";
import QuadrantPicker from "./QuadrantPicker";
import SectorsByNeed from "./SectorsByNeed";
import WinnerChecklist from "./WinnerChecklist";
import ValuationCalc from "./ValuationCalc";

// 每關用一個白話問題當標題，課程名稱放旁邊。
const QUESTION: Record<number, string> = {
  1: "世界景氣好嗎？",
  2: "市場上的錢變多還是變少？",
  3: "現在是景氣的哪一季？",
  4: "哪些產業現在順風？",
  5: "這個產業值得投資嗎？",
  6: "這家公司是不是贏家？",
  7: "這家公司值多少錢？",
  8: "該買還是不買？",
};

const GROUPS = [
  { name: "看世界", plain: "先看大環境：景氣好不好、錢多不多", steps: [1, 2, 3], deeper: { href: "/macro", text: "更多總經數字與圖表" } },
  { name: "看產業", plain: "再挑順風、有前途的產業", steps: [4, 5], deeper: { href: "/industry", text: "產業燈號與三要領打分卡" } },
  { name: "看公司", plain: "最後挑公司、算價格、決定買賣", steps: [6, 7, 8], deeper: null },
];

const HANDS_ON: Record<number, string> = {
  5: "換你動手：挑一個你有興趣的產業，用下面三個問題檢查。",
  6: "換你動手：挑一家公司，照清單打勾。",
  7: "換你動手：用下面的計算機算出目標價。",
  8: "看第 7 關計算機最下面的結果：買進、中立或不買。",
};

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

async function AutoAnswer({ step }: { step: 1 | 2 | 3 }) {
  const t = await getTodayAnswers();
  const a = step === 1 ? t.economy : step === 2 ? t.money : t.season;
  if (!a) return <p className="text-zinc-500">今天的數字暫時抓不到，可以先看下面的說明。</p>;
  return (
    <div className="space-y-1">
      <p className="flex items-start gap-2 font-medium">
        <span className="mt-1.5">
          <LightDot light={a.light} />
        </span>
        {a.answer}
      </p>
      <ul className="ml-5 list-disc text-sm text-zinc-600 dark:text-zinc-400">
        {a.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

async function Quadrant() {
  const t = await getTodayAnswers();
  return <QuadrantPicker auto={t.season?.phase ?? null} growth={t.growth} inflation={t.inflation} />;
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
          <ol className="list-inside list-decimal space-y-1">
            <li>市場夠大嗎？未來三年每年成長超過 10%</li>
            <li>別人很難搶嗎？有關鍵材料、技術或平台，至少一項</li>
            <li>是少數幾家在賺嗎？最大一家超過一半，或前三大加起來超過一半</li>
          </ol>
          <p>
            三題都過，就是值得投資的產業。可以在
            <Link href="/industry" className="mx-1 text-blue-600">
              產業打分卡
            </Link>
            幫你關心的產業打分數。
          </p>
          <details>
            <summary className="cursor-pointer text-zinc-500">產業也有生老病死</summary>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {LIFECYCLE.map((l) => (
                <li key={l.stage} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                  <span className="font-medium">{l.stage}</span>
                  <span className="ml-2 text-xs text-zinc-500">{l.examples}</span>
                  <p className="text-zinc-600 dark:text-zinc-400">{l.plain}</p>
                  <p>投資人：{l.investor}</p>
                </li>
              ))}
            </ul>
          </details>
        </div>
      );
    case 6:
      return <WinnerChecklist />;
    case 7:
      return (
        <div className="space-y-3">
          <ValuationCalc />
          <details>
            <summary className="cursor-pointer text-zinc-500">合理倍數怎麼抓</summary>
            <ul className="mt-1 list-inside list-disc text-zinc-600 dark:text-zinc-400">
              {FAIR_MULTIPLE.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </details>
        </div>
      );
    default:
      return null;
  }
}

function Level({ s }: { s: CompassStep }) {
  return (
    <section
      id={`level-${s.step}`}
      className="scroll-mt-4 space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <header className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 font-semibold text-zinc-900">
          {s.step}
        </span>
        <div>
          <h2 className="text-lg font-semibold">{QUESTION[s.step]}</h2>
          <p className="text-xs text-zinc-500">羅盤第 {s.step} 步：{s.title}</p>
        </div>
      </header>

      <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800/50">
        <p className="mb-1 text-xs text-zinc-500">今天的答案</p>
        {s.step <= 3 ? (
          <Suspense fallback={<p className="text-zinc-500">讀取中…</p>}>
            <AutoAnswer step={s.step as 1 | 2 | 3} />
          </Suspense>
        ) : s.step === 4 ? (
          <p>看你在第 3 關選的季節，下面亮起來的就是順風產業。</p>
        ) : (
          <p>{HANDS_ON[s.step]}</p>
        )}
      </div>

      {s.step !== 8 && (
        <div className="text-sm">
          <Tool step={s.step} />
        </div>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer font-medium">為什麼要看這關？</summary>
        <div className="mt-2 space-y-2">
          <p>{s.why}</p>
          <ul className="list-inside list-disc">
            {s.decide.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="rounded-md bg-amber-50 p-2 dark:bg-amber-950">課程案例：{s.example}</p>
        </div>
      </details>

      {s.watch.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">要看哪些數字？</summary>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {s.watch.map((w) => (
              <Watch key={w.name} w={w} />
            ))}
          </ul>
        </details>
      )}
      <p className="text-xs text-zinc-500">課程：總經X產業X個股 {s.units.join("、")}</p>
    </section>
  );
}

export default function MarketPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">看市場</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          8 關由大到小：先看世界，再挑產業，最後挑公司。每關先給答案，想知道為什麼再點開。內容來自 M平方〈總經X產業X個股〉的動態投資思維羅盤。
        </p>
        <nav className="flex flex-wrap gap-1 text-sm">
          {COMPASS_STEPS.map((s) => (
            <a key={s.step} href={`#level-${s.step}`} className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              {s.step}. {QUESTION[s.step]}
            </a>
          ))}
        </nav>
      </header>
      {GROUPS.map((g) => (
        <div key={g.name} className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-500">
            {g.name}・{g.plain}
          </h2>
          {g.steps.map((n) => (
            <Level key={n} s={COMPASS_STEPS[n - 1]} />
          ))}
          {g.deeper && (
            <p className="text-sm">
              想看更多？
              <Link href={g.deeper.href} className="ml-1 text-blue-600">
                {g.deeper.text} →
              </Link>
            </p>
          )}
        </div>
      ))}
      <CourseRefs slug="compass" />
    </div>
  );
}
