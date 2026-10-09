import CourseRefs from "@/components/CourseRefs";
import RiskQuiz from "./RiskQuiz";

export default function RiskPage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-zinc-500">基礎 2</p>
        <h1 className="text-2xl font-semibold">風險屬性</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          20 題、四個維度加權成 0–100 分：財務狀況 25%、投資經驗 20%、投資目標 20%、風險心理承受度 35%。
          沒有標準答案，請照真實感受回答；建議每年重測一次。結果會帶入「持股與 ETF 健檢」的目標配置。
        </p>
      </header>
      <RiskQuiz />
      <CourseRefs slug="risk" />
    </div>
  );
}
