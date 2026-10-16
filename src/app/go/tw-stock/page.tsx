import { connection } from "next/server";
import { Suspense } from "react";
import { getPicks } from "@/lib/pickData";
import GoWizard from "./GoWizard";

export const metadata = { title: "帶我做：台股短線｜投資羅盤" };

async function Live() {
  await connection();
  const data = await getPicks();
  if ("error" in data)
    return (
      <p className="rounded-2xl bg-[#f3ead8] p-4 text-sm dark:bg-[#2f281f]">
        今天的名單暫時抓不到，等一下再來。
        <span className="block text-xs text-stone-500">卡在：{data.error}</span>
      </p>
    );
  return <GoWizard date={data.date} market={data.market} picks={data.picks} />;
}

export default function GoTwStock() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-black">📋 帶我做：台股大戶進場的波段</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          照「衝一把／短線操作卡」的條件，一步一步帶你從挑股票、算張數、下單，到設好停損。每一步做完再按下一步。
        </p>
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          名單是照條件篩出來的，不是推薦哪一檔會漲。條件過了也可能賠，所以第
          ④、⑤ 步的停損一定要做。最後按下單的是你自己。
        </p>
      </header>
      <Suspense
        fallback={
          <p className="rounded-2xl bg-[#f3ead8] p-4 text-sm dark:bg-[#2f281f]">
            正在照條件篩今天的名單⋯⋯
          </p>
        }
      >
        <Live />
      </Suspense>
    </div>
  );
}
