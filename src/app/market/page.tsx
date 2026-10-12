import Link from "next/link";
import { Suspense } from "react";
import CourseRefs from "@/components/CourseRefs";
import LightDot from "@/components/Light";
import { getSeries } from "@/lib/fred";
import { FRED_VIEW } from "@/lib/compass";
import { COMPASS_STEPS, CompassStep, FAIR_MULTIPLE, LIFECYCLE, WatchItem } from "@/lib/compassData";
import { getTodayAnswers } from "@/lib/todayData";
import { INDICATORS, applyTransform } from "@/lib/macro";
import { TILES, clockTrail, tilesOf } from "@/lib/live";
import { getIndproYoy, getLiveSeries } from "@/lib/liveData";
import LiveBoard from "./LiveBoard";
import CycleClock from "./CycleClock";
import WhatIf from "./WhatIf";
import WorldFacets from "./WorldFacets";
import CompassHub, { HubStep } from "./CompassHub";
import ChainExplorer from "./ChainExplorer";
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

const SHORT: Record<number, string> = { 1: "景氣", 2: "資金", 3: "季節", 4: "順風產業", 5: "產業鏈", 6: "贏家公司", 7: "值多少", 8: "買或賣" };
const GROUP_OF = (n: number): HubStep["group"] => (n <= 3 ? "world" : n <= 5 ? "industry" : "company");

// 每關最後「想看更多」的延伸頁。
const DEEPER: Record<number, { href: string; text: string }> = {
  1: { href: "/macro", text: "更多總經數字與圖表" },
  3: { href: "/macro", text: "十張圖逐張看" },
  5: { href: "/industry", text: "產業燈號與三要領打分卡" },
};

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

// 〈15單元看懂經濟運行〉補充的單元，和羅盤單元一起列在每關最後。
const MACRO_UNITS: Record<number, string> = {
  1: "1-1、1-3、2-3、2-4、4-1",
  2: "3-1、3-5、3-6、3-7",
  3: "2-1、2-2、3-7",
};

async function Board({ level, overlay }: { level: number; overlay?: string }) {
  const ids = tilesOf(level).map((t) => t.id);
  const data = await getLiveSeries(ids);
  return <LiveBoard ids={ids} data={data} overlayId={overlay} />;
}

async function Scenarios() {
  const data = await getLiveSeries(TILES.map((t) => t.id));
  const latest = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v?.at(-1)?.value ?? null]));
  return <WhatIf latest={latest} />;
}

async function Clock() {
  const [yoy, t] = await Promise.all([getIndproYoy(), getTodayAnswers()]);
  const { avg, trail } = clockTrail(yoy ?? []);
  return <CycleClock avg={avg} trail={trail} compassPhase={t.season?.phase ?? null} />;
}

// 〈15單元〉4-1 十張圖裡能自動抓的反轉指標，亮幾顆紅燈。燈數對應的動作是本站自訂，不是課程規則。
async function Alarms() {
  const data = await Promise.all(INDICATORS.map((i) => getSeries(i.id)));
  const rows = INDICATORS.map((ind, i) => {
    const raw = data[i];
    const v = raw ? applyTransform(raw, ind.transform).at(-1)?.value : undefined;
    return { ind, verdict: v === undefined ? null : ind.judge(v) };
  }).filter((r) => r.verdict);
  if (!rows.length) return null;
  const warn = rows.filter((r) => r.verdict!.signal === "warn").length;
  const pct = Math.round((warn / rows.length) * 100);
  const msg = warn <= 1 ? "照原本計畫" : warn <= 3 ? "多留一點現金，分批進出" : "偏防守，等警報解除";
  return (
    <div data-tour="alarm" className="space-y-2 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
      <p className="font-medium">
        景氣反轉警報：{warn} / {rows.length} 顆亮紅燈
      </p>
      <div className="h-3 overflow-hidden rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-red-300 dark:from-emerald-900 dark:via-amber-900 dark:to-red-900">
        <div className="animate-grow h-full origin-left rounded-full bg-zinc-900/70 dark:bg-white/70" style={{ width: `${Math.max(pct, 3)}%` }} />
      </div>
      <p>現在建議：{msg}（本站自訂的參考，不是課程規則）</p>
      <ul className="flex flex-wrap gap-1 text-xs">
        {rows.map((r) => (
          <li
            key={r.ind.id}
            className={`rounded px-1.5 py-0.5 ${
              r.verdict!.signal === "warn" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            {r.ind.title}：{r.verdict!.text}
          </li>
        ))}
      </ul>
      <p className="text-xs text-zinc-500">
        課程：總經 4-1 十張圖。
        <Link href="/macro" className="ml-1 text-blue-600">
          看每張圖 →
        </Link>
      </p>
    </div>
  );
}

function Loading() {
  return <div className="h-40 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />;
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
    case 1:
      return (
        <WorldFacets
          us={
            <Suspense fallback={<Loading />}>
              <Board level={1} overlay="PAYEMS" />
            </Suspense>
          }
        />
      );
    case 2:
      return (
        <div className="space-y-4">
          <Suspense fallback={<Loading />}>
            <Board level={2} />
          </Suspense>
          <div className="space-y-2">
            <p className="font-medium">如果……會怎樣？</p>
            <p className="text-zinc-600 dark:text-zinc-400">經濟是一台會連鎖反應的機器。點一個情境，看它一步一步怎麼傳下去。</p>
            <Suspense fallback={<Loading />}>
              <Scenarios />
            </Suspense>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="space-y-4">
          <Suspense fallback={<Loading />}>
            <Clock />
          </Suspense>
          <Suspense fallback={<Loading />}>
            <Board level={3} />
          </Suspense>
          <Suspense fallback={<Loading />}>
            <Alarms />
          </Suspense>
        </div>
      );
    case 4:
      return <SectorsByNeed />;
    case 5:
      return (
        <div className="space-y-4">
          <ChainExplorer />
          <p className="font-medium">用三個問題檢查任何產業</p>
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
    <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 font-semibold text-zinc-900">
          {s.step}
        </span>
        <div>
          <h2 className="text-lg font-semibold">{QUESTION[s.step]}</h2>
          <p className="text-xs text-zinc-500">羅盤第 {s.step} 步：{s.title}</p>
        </div>
      </header>

      <div data-tour="answer" className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800/50">
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
      <p className="text-xs text-zinc-500">
        課程：總經X產業X個股 {s.units.join("、")}
        {MACRO_UNITS[s.step] && `；15單元看懂經濟運行 ${MACRO_UNITS[s.step]}`}
      </p>
      {DEEPER[s.step] && (
        <Link href={DEEPER[s.step].href} className="block text-sm text-blue-600">
          想看更多：{DEEPER[s.step].text} →
        </Link>
      )}
    </section>
  );
}

export default function MarketPage() {
  const steps: HubStep[] = COMPASS_STEPS.map((s) => ({
    step: s.step,
    short: SHORT[s.step],
    question: QUESTION[s.step],
    group: GROUP_OF(s.step),
  }));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">看市場</h1>
      <CompassHub steps={steps} panels={COMPASS_STEPS.map((s) => <Level key={s.step} s={s} />)} />
      <CourseRefs slug="compass" />
    </div>
  );
}
