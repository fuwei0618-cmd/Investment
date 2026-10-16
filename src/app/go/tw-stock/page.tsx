import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { OTHER_PLAYS } from "@/lib/otherPlays";
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
  return (
    <GoWizard
      date={data.date}
      market={data.market}
      picks={data.picks}
      inverse={data.inverse}
    />
  );
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
      <details className="rounded-2xl bg-[#f3ead8] p-4 dark:bg-[#2f281f]">
        <summary className="cursor-pointer font-bold">
          同事常聊的其他買法，跟這張卡差在哪？（{OTHER_PLAYS.length} 種）
        </summary>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          聽到別人怎麼買，先在這裡找是哪一種，再回來看跟上面這張卡差在哪。一次只練一種，練熟再換。
        </p>
        <ul className="mt-3 space-y-3">
          {OTHER_PLAYS.map((o) => (
            <li
              key={o.name}
              className="rounded-xl bg-white p-3 text-sm dark:bg-stone-900"
            >
              <b className="text-base">{o.name}</b>
              <span className="block text-stone-500">同事會說：{o.heard}</span>
              <span className="block">
                <b>怎麼買：</b>
                {o.how}
              </span>
              <span className="block">
                <b>跟這張卡：</b>
                {o.vs}
              </span>
              {o.href && (
                <Link
                  href={o.href}
                  className="mt-1 inline-block text-blue-700 underline dark:text-blue-400"
                >
                  網站裡看：{o.where} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
