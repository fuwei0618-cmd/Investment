import Crumb from "@/components/Crumb";
import ToolCards from "./ToolCards";

export const metadata = { title: "投資工具比較｜投資羅盤" };

export default function ToolsPage() {
  return (
    <div className="space-y-4">
      <header>
        <Crumb href="/market" area="看市場" here="延伸：投資工具" />
        <h1 className="text-2xl font-semibold">🧰 投資工具比較</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          客戶講到的每一種工具，都用同一張卡回答：是什麼、怎麼賺、怎麼賠、課程怎麼說、客戶問到時怎麼回。
        </p>
      </header>
      <ToolCards />
      <p className="text-xs text-zinc-500">
        課程：王伯達人生財務規劃學第三章（股票、債券、房地產、原物料、加密貨幣）、高效AI投資術 1-3（常用投資工具）。標「一般常識」的是課程沒專講、另外補的。
      </p>
    </div>
  );
}
