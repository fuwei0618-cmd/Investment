import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { aboveMa20 } from "@/lib/us";
import { getUsBars, getUsPicks } from "@/lib/usData";
import UsWizard from "./UsWizard";

export const metadata = { title: "帶我做：美股強勢股突破｜投資羅盤" };

async function Live() {
  await connection();
  const [d, bars] = await Promise.all([getUsPicks(), getUsBars(["^GSPC"])]);
  if ("error" in d)
    return (
      <p className="rounded-2xl bg-[#f3ead8] p-4 text-sm dark:bg-[#2f281f]">
        今天的美股名單暫時抓不到，等一下再來。
        <span className="block text-xs text-stone-500">卡在：{d.error}</span>
      </p>
    );
  return (
    <UsWizard date={d.date} market={aboveMa20(bars["^GSPC"])} picks={d.picks} />
  );
}

export default function UsStock() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-black">📋 帶我做：美股強勢股突破</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          跟著已經在漲、有大錢在搶的大公司上車，坐幾週的波段，跌破停損就下車。一步一步帶你挑股票、算股數、用國泰複委託下單，到設好停損。
        </p>
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          名單是照條件篩出來的，不是推薦哪一檔會漲。條件過了也可能賠，所以停損一定要做。最後按下單的是你自己。
        </p>
        <Link
          href="/desk/us"
          className="text-sm text-blue-700 underline dark:text-blue-400"
        >
          ← 回美股實戰
        </Link>
      </header>
      <Suspense fallback={<p className="text-sm text-stone-500">讀取中⋯⋯</p>}>
        <Live />
      </Suspense>
    </div>
  );
}
