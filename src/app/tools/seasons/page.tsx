import Link from "next/link";
import Crumb from "@/components/Crumb";
import { WHY_SIX } from "@/lib/six";
import SeasonTable from "./SeasonTable";

export const metadata = { title: "六種放法四季總表｜投資羅盤" };

export default function SeasonsPage() {
  return (
    <div className="space-y-4">
      <header>
        <Crumb href="/tools" area="投資工具" here="六種放法 × 四季" />
        <h1 className="text-2xl font-semibold">🥐 你有 1 萬元，在麵包鎮有六種放法</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          鎮上的四個季節（遊戲裡「成長 × 物價」那四格）× 六種放法，全部結果一張表。點左邊的季節，下面的原因會換成那一季；點上面的名字看那張工具卡。
        </p>
      </header>

      <SeasonTable />

      <section className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">為什麼是這六種</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">錢能放的地方，大致就這六個方向。期貨、選擇權這些，多半是它們的變形或加上槓桿，放在工具頁查。</p>
        <ul className="space-y-1 text-sm">
          {WHY_SIX.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">錢怎麼回到你口袋：配息、除息</h2>
        <p className="text-sm">
          股東拿股利、整條街拿基金配息、債主拿利息、房東拿租金，金幣沒有，金庫拿定存利息。配息那天叫除息，股價會先扣掉發出去的錢：
        </p>
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold tabular-nums">
          <span className="rounded-md bg-zinc-100 px-2 py-1 dark:bg-zinc-800">股票 100 元</span>→
          <span className="rounded-md bg-zinc-100 px-2 py-1 dark:bg-zinc-800">股票 95 元＋現金 5 元</span>＝ 還是 100 元
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">之後漲回 100 元叫填息，那時才是真的多賺。所以比較時看「漲跌＋配息」的總和，不要只看配息高不高。</p>
      </section>

      <p className="text-sm">
        <Link href="/game/bakery.html" className="text-blue-600">
          🎲 回麵包店大富翁
        </Link>
      </p>
      <p className="text-xs text-zinc-500">
        表情是課程景氣時鐘的大方向，每一次不一定一樣，不是保證。成本＝台股買進加賣出一次的手續費和稅，加上基金一年管理費的大約數字。平常一年用課程歷史平均換算：整條街＝0050（2003–2019 年平均 8.48%、最慘 −43%）、借錢＝美國綜合債（平均 7.5%）、房東＝美國權益型不動產投資信託（平均 11.7%）；定存用課程當時約 1%。借錢、房東、金幣的最慘一年是公開資料（債券 2022 年約 −13%、不動產投資信託 2008 年約 −38%、黃金 2013 年約 −28%），課程沒講；金幣成本是銀行黃金存摺買賣價差的大約數字。
      </p>
    </div>
  );
}
