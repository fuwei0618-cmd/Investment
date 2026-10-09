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
        <p className="text-sm text-zinc-500">第 1 章</p>
        <h1 className="text-2xl font-semibold">產業脈絡</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          先由全球脈動的景氣象限挑出 EPS 增速較佳的板塊，再用三大要領檢查產業投資價值，最後才進入選股。
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
