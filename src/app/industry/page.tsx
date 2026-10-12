import Crumb from "@/components/Crumb";
import CourseRefs from "@/components/CourseRefs";
import { Suspense } from "react";
import { applyTransform } from "@/lib/macro";
import { getSeries } from "@/lib/fred";
import { SECTORS } from "@/lib/industry";
import SectorBoard, { SignalView } from "./SectorBoard";
import IndustryChecklist from "./IndustryChecklist";

async function Sectors() {
  const signals: Record<string, SignalView | null> = {};
  await Promise.all(
    SECTORS.map(async (s) => {
      const raw = await getSeries(s.auto.id);
      const series = raw ? applyTransform(raw, s.auto.transform) : null;
      const last = series?.at(-1);
      signals[s.key] =
        series && last
          ? { value: last.value, date: last.date, ...s.auto.judge(series), series: series.slice(-260) }
          : null;
    }),
  );
  return <SectorBoard signals={signals} />;
}

export default function IndustryPage() {
  return (
    <div className="space-y-6">
      <header>
        <Crumb href="/market#level-4" area="看市場" here="第 4–5 關的產業工具" />
        <h1 className="text-2xl font-semibold">產業燈號與打分卡</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          看市場第 4–5 關的工具：每個產業現在順不順風，以及用三個問題替產業打分數。
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-zinc-500">讀取產業指標中…</p>}>
        <Sectors />
      </Suspense>
      <IndustryChecklist />
      <CourseRefs slug="industry" />
    </div>
  );
}
