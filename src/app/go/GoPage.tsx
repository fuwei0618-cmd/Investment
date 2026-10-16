import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { OTHER_PLAYS } from "@/lib/otherPlays";
import { getPicks } from "@/lib/pickData";
import { MAIN_PLAY, TRUST_PLAY } from "@/lib/otherPlays";
import type { PlayId } from "@/lib/pickData";
import GoWizard from "./GoWizard";
import PlayCard from "./PlayCard";

const HREF: Record<PlayId, string> = {
  breakout: "/go/tw-stock",
  trust: "/go/tw-trust",
};

// 每張有「帶我做」的策略卡：標題、開場白、名單怎麼挑
export const GO_PLAYS: Record<
  PlayId,
  { title: string; intro: string; listIntro: string; guide: typeof MAIN_PLAY }
> = {
  breakout: {
    title: "台股大戶進場的波段",
    intro:
      "照「衝一把／短線操作卡」的條件，一步一步帶你從挑股票、算張數、下單，到設好停損。每一步做完再按下一步。",
    listIntro:
      "先找今天外資和投信都有買的股票，再看操作卡的三個條件：大戶連買三天以上、成交量是平常兩倍以上、收盤突破前 20 天最高價。三個都過才算符合。",
    guide: MAIN_PLAY,
  },
  trust: {
    title: "跟著投信買",
    intro:
      "跟在投信（國內基金）後面上車，在他們下車或季底前先走。一步一步帶你挑股票、算張數、下單，到設好停損。",
    listIntro:
      "先找今天投信有買的股票，再看三個條件：投信連買三天以上、近 20 天漲不到 15%、收盤在月線之上。三個都過才算符合。",
    guide: TRUST_PLAY,
  },
};

async function Live({ play }: { play: PlayId }) {
  await connection();
  const data = await getPicks(play);
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
      listIntro={GO_PLAYS[play].listIntro}
    />
  );
}

export function GoPage({ play }: { play: PlayId }) {
  const g = GO_PLAYS[play];
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-black">📋 帶我做：{g.title}</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">{g.intro}</p>
        <nav className="flex flex-wrap gap-2 text-sm">
          <span className="text-stone-500">策略卡：</span>
          {(Object.keys(GO_PLAYS) as PlayId[]).map((id) => (
            <Link
              key={id}
              href={HREF[id]}
              aria-current={id === play ? "page" : undefined}
              className={`rounded-full px-3 py-0.5 font-bold ${id === play ? "bg-[#b4651e] text-white" : "bg-[#f3ead8] dark:bg-[#2f281f]"}`}
            >
              {GO_PLAYS[id].title}
            </Link>
          ))}
        </nav>
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          名單是照條件篩出來的，不是推薦哪一檔會漲。條件過了也可能賠，所以第
          ④、⑤ 步的停損一定要做。最後按下單的是你自己。
        </p>
      </header>
      <PlayCard guide={g.guide} />
      <Suspense
        fallback={
          <p className="rounded-2xl bg-[#f3ead8] p-4 text-sm dark:bg-[#2f281f]">
            正在照條件篩今天的名單⋯⋯
          </p>
        }
      >
        <Live play={play} />
      </Suspense>
      <details className="rounded-2xl bg-[#f3ead8] p-4 dark:bg-[#2f281f]">
        <summary className="cursor-pointer font-bold">
          同事常聊的其他買法，跟「大戶進場的波段」差在哪？（{OTHER_PLAYS.length}{" "}
          種）
        </summary>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          聽到別人怎麼買，先在這裡找是哪一種，再看它跟「大戶進場的波段」差在哪。一次只練一種，練熟再換。
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
                <b>跟大戶波段比：</b>
                {o.vs}
              </span>
              <details className="mt-1">
                <summary className="cursor-pointer text-[#b4651e]">
                  看完整說明：為什麼會賺、怎麼做、什麼時候會賠
                </summary>
                <div className="mt-1 space-y-1">
                  <p>
                    <b>為什麼會賺：</b>
                    {o.why}
                  </p>
                  <b>怎麼做：</b>
                  <ol className="list-decimal pl-5">
                    {o.flow.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ol>
                  <p>
                    <b>什麼時候會賠：</b>
                    {o.lose}
                  </p>
                </div>
              </details>
              {o.go && (
                <Link
                  href={o.go}
                  className="mr-3 mt-1 inline-block font-bold text-[#b4651e] underline"
                >
                  帶我做這一種 →
                </Link>
              )}
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
