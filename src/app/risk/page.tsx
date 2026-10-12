import Crumb from "@/components/Crumb";
import CourseRefs from "@/components/CourseRefs";
import RiskQuiz from "./RiskQuiz";

export default function RiskPage() {
  return (
    <div className="space-y-4">
      <header>
        <Crumb href="/money" area="我的錢" here="第 2 步：測風險" />
        <h1 className="text-2xl font-semibold">我能承受多少風險？</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          20 題，照真實感受回答就好，沒有標準答案。做完會告訴你是哪一型，以及建議多少錢放股票、多少放安全的地方。每年重做一次。
        </p>
      </header>
      <RiskQuiz />
      <CourseRefs slug="risk" />
    </div>
  );
}
