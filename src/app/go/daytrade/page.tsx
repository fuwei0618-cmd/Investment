import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getDayTradeHot } from "@/lib/dayTradeData";
import { DAYTRADE_PLAY } from "@/lib/otherPlays";
import { links } from "@/lib/pick";
import PlayCard from "../PlayCard";
import CostCalc from "./CostCalc";
import LiveBoard from "./LiveBoard";
import SimLog from "./SimLog";

export const metadata = { title: "認識當沖｜投資羅盤" };

const box =
  "space-y-3 rounded-2xl bg-[#fffdf8] p-4 shadow-[0_1px_2px_rgba(60,40,10,.06),0_6px_16px_rgba(60,40,10,.08)] dark:bg-[#221d16]";

async function Hot() {
  await connection();
  const d = await getDayTradeHot();
  if ("error" in d)
    return (
      <>
        <LiveBoard suggest={[]} />
        <p className="text-sm text-stone-500">
          當沖熱門名單暫時抓不到（卡在：{d.error}）。
        </p>
      </>
    );
  return (
    <>
      <LiveBoard suggest={d.rows} />
      <section className={box}>
        <h2 className="text-xl font-black">④ 昨天當沖最熱的股票（{d.date}）</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          證交所每天公布每檔股票有多少是當沖成交的。這張表讓你知道同事可能在玩哪些，
          <b>不是推薦</b>
          。當沖比例越高，代表這檔今天的成交很多是短線客在進出，價格跳得也越兇。
        </p>
        <ol className="space-y-1.5 text-sm">
          {d.rows.map((r, i) => (
            <li
              key={r.code}
              className="flex flex-wrap items-baseline gap-x-3 rounded-xl bg-[#f3ead8] px-3 py-2 dark:bg-[#2f281f]"
            >
              <b className="w-6 text-stone-500">{i + 1}</b>
              <b>
                {r.name} <span className="text-stone-500">{r.code}</span>
              </b>
              <span>當沖 {r.lots.toLocaleString("zh-TW")} 張</span>
              {r.ratio != null && (
                <span className="text-red-700 dark:text-red-400">
                  佔成交量 {(r.ratio * 100).toFixed(0)}%
                </span>
              )}
              <a
                href={links(r.code).chart}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-xs text-blue-700 underline dark:text-blue-400"
              >
                看 K 線 ↗
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

export default function DayTrade() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-black">⚡ 認識當沖</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          同事在聊的當沖是什麼、要花多少成本、他們在玩哪些股票。這頁是讓你看懂，不帶你下單。
        </p>
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          當沖風險很高，新手多半賠錢。想試的話，先用很小的金額，而且每一筆都先算過成本。
        </p>
      </header>
      <PlayCard guide={DAYTRADE_PLAY} />

      <section className={box}>
        <h2 className="text-xl font-black">① 成本試算：要漲多少才打平？</h2>
        <CostCalc />
      </section>

      <section className={box}>
        <h2 className="text-xl font-black">② 先模擬一個月：記下來看會不會賺</h2>
        <SimLog />
      </section>

      <section className={box}>
        <h2 className="text-xl font-black">③ 盤中即時看</h2>
        <Suspense fallback={<p className="text-sm text-stone-500">讀取中⋯⋯</p>}>
          <Hot />
        </Suspense>
      </section>

      <section className={box}>
        <h2 className="text-xl font-black">⑤ 開始前一定要知道的事</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            <b>資格：</b>
            開戶滿三個月、近一年成交過十筆以上，還要簽「當沖風險預告書」，券商才會開通。
          </li>
          <li>
            <b>兩種做法：</b>
            先買後賣（看漲）；先賣後買（看跌，要另外申請，部分股票不能先賣）。
          </li>
          <li>
            <b>一定要當天沖掉：</b>
            沒沖掉的部分兩天後要拿全額交割，帳戶錢不夠就是違約交割，會留下信用紀錄，嚴重的還有刑責。
          </li>
          <li>
            <b>帳戶裡要有錢：</b>
            雖然當沖只結算差價，但券商會看你的額度，不要用借來的錢做。
          </li>
        </ul>
        <p className="text-sm">
          想比較穩的短線，回去看{" "}
          <Link
            href="/go/tw-stock"
            className="text-blue-700 underline dark:text-blue-400"
          >
            大戶進場的波段
          </Link>{" "}
          或{" "}
          <Link
            href="/go/tw-trust"
            className="text-blue-700 underline dark:text-blue-400"
          >
            跟著投信買
          </Link>
          。
        </p>
      </section>
    </div>
  );
}
