import CourseRefs from "@/components/CourseRefs";
import GoalsCalculator from "./GoalsCalculator";

export default function GoalsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">我要存多少錢才夠？</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          把年紀、收入、花費填進去，網頁會一年一年幫你算：錢夠不夠用、退休前要存到多少。退休要準備的錢＝一年花費 × 25；收入能存下 25%～50% 最理想。
        </p>
      </header>
      <GoalsCalculator />
      <CourseRefs slug="goals" />
    </div>
  );
}
