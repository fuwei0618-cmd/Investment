import Crumb from "@/components/Crumb";
import CourseRefs from "@/components/CourseRefs";
import PortfolioManager from "./PortfolioManager";

export default function PortfolioPage() {
  return (
    <div className="space-y-4">
      <header>
        <Crumb href="/money" area="我的錢" here="第 3 步：看持股" />
        <h1 className="text-2xl font-semibold">我手上的投資健康嗎？</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          記下每一筆買賣，網頁會算你賺多少、賠多少，並提醒股票是不是放太多、某一檔是不是佔太重。資料只存在這台裝置，可以匯出備份。
        </p>
      </header>
      <PortfolioManager />
      <CourseRefs slug="portfolio" />
    </div>
  );
}
