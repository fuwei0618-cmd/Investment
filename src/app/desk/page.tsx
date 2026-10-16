import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import LightDot from "@/components/Light";
import { hotStreets, mood, PLAYERS } from "@/lib/chips";
import { getChips, getStreets } from "@/lib/chipsData";
import { closeAndMa, verdict } from "@/lib/desk";
import { getTaiex } from "@/lib/deskData";
import { getPicks, type PlayId } from "@/lib/pickData";
import { getTodayAnswers } from "@/lib/todayData";
import LiveBoard from "../go/daytrade/LiveBoard";
import { GO_PLAYS, HREF } from "../go/GoPage";
import Holdings from "./Holdings";
import Scorecard from "./Scorecard";
import LineSetup from "./LineSetup";
import TrackedNews from "./TrackedNews";
import {
  Calendar,
  Macro,
  MarketSwitch,
  Section,
  TopThree,
  Why,
  more,
  sign,
  wait,
} from "./parts";

export const metadata = { title: "實戰｜投資羅盤" };

// 最上面：今天買不買、買哪一檔、手上哪檔要賣，加一行這一季適合的工具
async function Top() {
  await connection();
  const plays: PlayId[] = ["breakout", "trust"];
  const [taiex, chips, t, ...lists] = await Promise.all([
    getTaiex(),
    getChips(),
    getTodayAnswers(),
    ...plays.map((p) => getPicks(p)),
  ]);
  const m = chips ? mood(chips.days, chips.margin?.change ?? null) : null;
  const v = verdict({
    above: taiex?.above ?? null,
    mood: m?.light ?? null,
    season: t.season?.light ?? null,
  });
  let pick = null;
  for (const [i, id] of plays.entries()) {
    const d = lists[i];
    const x = "picks" in d ? d.picks.find((p) => p.pass) : undefined;
    if (x) {
      pick = {
        name: x.name,
        code: x.code,
        href: HREF[id],
        note: `三個條件全過（${GO_PLAYS[id].title}），收 ${Math.round(x.close * 100) / 100}。`,
      };
      break;
    }
  }
  return (
    <TopThree v={v} pick={pick} phase={t.season?.phase ?? null} market="tw" />
  );
}

async function Go() {
  await connection();
  const [taiex, chips, t] = await Promise.all([
    getTaiex(),
    getChips(),
    getTodayAnswers(),
  ]);
  const m = chips ? mood(chips.days, chips.margin?.change ?? null) : null;
  const v = verdict({
    above: taiex?.above ?? null,
    mood: m?.light ?? null,
    season: t.season?.light ?? null,
  });
  const rows = [
    {
      q: "大盤在月線上嗎？",
      light: taiex ? (taiex.above ? "green" : "red") : null,
      a: taiex
        ? `加權指數 ${closeAndMa(taiex.close, taiex.ma).join("，月線 ")}，${taiex.above ? "在上面" : "在下面"}。`
        : "暫時抓不到",
    },
    {
      q: "大戶在進場嗎？",
      light: m?.light ?? null,
      a: m ? `${m.name}：${m.line}` : "暫時抓不到",
    },
    {
      q: "景氣在哪一季？",
      light: t.season?.light ?? null,
      a: t.season?.answer ?? "暫時抓不到",
    },
  ] as const;
  return (
    <>
      <div className="flex items-start gap-3 rounded-xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]">
        <span className="mt-2">
          <LightDot light={v.light} />
        </span>
        <div>
          <p className="text-2xl font-black">{v.title}</p>
          <p className="text-[15px]">{v.todo}</p>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {rows.map((r) => (
          <li key={r.q} className="flex items-start gap-2">
            <span className="mt-1">
              <LightDot light={r.light} />
            </span>
            <span>
              <b>{r.q}</b> {r.a}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-500">
        為什麼先看大盤：兩張策略卡都要求大盤在月線上才買股票，大盤往下時，好股票也常被拖著跌。
      </p>
    </>
  );
}

// ② 總體經濟
async function Market() {
  await connection();
  const [taiex, chips, map] = await Promise.all([
    getTaiex(),
    getChips(),
    getStreets(),
  ]);
  const last = chips?.days.at(-1);
  const hot = "streets" in map ? hotStreets(map.streets) : null;
  return (
    <ul className="space-y-2 text-sm">
      <li>
        <b>大盤：</b>
        {taiex ? (
          <>
            {taiex.date} 收 {taiex.close.toFixed(0)} 點
            {taiex.change != null && (
              <span
                className={
                  taiex.change >= 0
                    ? "text-red-700 dark:text-red-400"
                    : "text-green-700 dark:text-green-400"
                }
              >
                （{sign(taiex.change * 100, 2)}%）
              </span>
            )}
            ，離月線 {sign((taiex.close / taiex.ma - 1) * 100, 1)}%。
          </>
        ) : (
          "暫時抓不到"
        )}
      </li>
      <li>
        <b>三大法人（{last?.date ?? "—"}）：</b>
        {last
          ? PLAYERS.map(
              (p) =>
                `${p.name}${last.net[p.id] >= 0 ? "買" : "賣"} ${Math.abs(last.net[p.id]).toFixed(0)} 億`,
            ).join("、")
          : "暫時抓不到"}
        。
      </li>
      {chips?.margin && (
        <li>
          <b>散戶借錢買（融資）：</b>
          {chips.margin.change >= 0 ? "增加" : "減少"}{" "}
          {Math.abs(chips.margin.change).toFixed(0)} 億。
          大盤跌、融資卻一直增加，代表散戶在接，要小心。
        </li>
      )}
      {hot && (hot.buy || hot.sell) && (
        <li>
          <b>外資最愛和最不要的產業：</b>
          {hot.buy && `買最多「${hot.buy}」`}
          {hot.buy && hot.sell && "、"}
          {hot.sell && `賣最多「${hot.sell}」`}。
        </li>
      )}
      <li>
        <Link href="/chips" className={more}>
          去大戶劇場看完整的法人動向 →
        </Link>
      </li>
    </ul>
  );
}

// ④ 今天必知大事
async function Picks() {
  await connection();
  const plays: PlayId[] = ["breakout", "trust"];
  const lists = await Promise.all(plays.map((p) => getPicks(p)));
  const first = lists.find((d) => "market" in d);
  const below = first && "market" in first && first.market?.above === false;
  return (
    <>
      {below && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-100">
          大盤在月線下，下面的名單只是讓你知道大戶在買什麼，今天先不要照著買。
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {plays.map((id, i) => {
          const d = lists[i];
          const passed =
            "picks" in d ? d.picks.filter((x) => x.pass).slice(0, 3) : [];
          const near =
            "picks" in d
              ? d.picks
                  .filter((x) => !x.pass && x.score > 0)
                  .slice(0, 3 - passed.length)
              : [];
          return (
            <div
              key={id}
              className="space-y-2 rounded-xl bg-[#f3ead8] p-3 text-sm dark:bg-[#2f281f]"
            >
              <b className="text-base">{GO_PLAYS[id].title}</b>
              {"error" in d ? (
                <p className="text-stone-500">名單暫時抓不到。</p>
              ) : (
                <ul className="space-y-1">
                  {passed.map((x) => (
                    <li key={x.code}>
                      <span className="text-red-700 dark:text-red-400">
                        三個條件全過　
                      </span>
                      <b>{x.name}</b> {x.code}　收{" "}
                      {Math.round(x.close * 100) / 100}
                    </li>
                  ))}
                  {near.map((x) => (
                    <li
                      key={x.code}
                      className="text-stone-600 dark:text-stone-400"
                    >
                      差一點（過 {x.score} 個）　{x.name} {x.code}
                    </li>
                  ))}
                  {!passed.length && !near.length && (
                    <li className="text-stone-500">今天沒有候選。</li>
                  )}
                </ul>
              )}
              <Link href={HREF[id]} className={more}>
                帶我做 →
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function Desk() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-black">實戰</h1>
        <MarketSwitch now="tw" />
        <p className="text-sm text-stone-600 dark:text-stone-400">
          每天開盤前看最上面三個問題就好。想知道為什麼，再打開下面的「為什麼？」。
        </p>
      </header>
      <Suspense fallback={wait}>
        <Top />
      </Suspense>
      <Why>
        <nav className="flex flex-wrap gap-1.5 text-xs">
          {[
            ["go", "能不能出手"],
            ["macro", "總體經濟"],
            ["market", "市場情況"],
            ["news", "必知大事"],
            ["watch", "追蹤清單"],
            ["picks", "策略卡名單"],
            ["hold", "持股提醒"],
            ["score", "成績單"],
          ].map(([id, t]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-full bg-[#f3ead8] px-2.5 py-0.5 dark:bg-[#2f281f]"
            >
              {t}
            </a>
          ))}
        </nav>
        <Section id="go" title="① 今天能不能出手">
          <Suspense fallback={wait}>
            <Go />
          </Suspense>
        </Section>
        <Section id="macro" title="② 總體經濟">
          <Suspense fallback={wait}>
            <Macro />
          </Suspense>
        </Section>
        <Section id="market" title="③ 市場情況">
          <Suspense fallback={wait}>
            <Market />
          </Suspense>
        </Section>
        <Section id="news" title="④ 今天必知大事">
          <Suspense fallback={wait}>
            <Calendar market="tw" />
          </Suspense>
          <h3 className="font-bold">追蹤股票的新聞（最近三天）</h3>
          <TrackedNews />
        </Section>
        <Section id="watch" title="⑤ 我的追蹤清單">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            一定要盯的幾檔。跟「認識當沖」頁是同一份清單，在哪邊加都會一起變。
          </p>
          <LiveBoard suggest={[]} />
        </Section>
        <Section id="picks" title="⑥ 今天的策略卡名單">
          <Suspense fallback={wait}>
            <Picks />
          </Suspense>
        </Section>
        <Section id="hold" title="⑦ 我的持股提醒">
          <Holdings />
          <LineSetup />
        </Section>
        <Section id="score" title="⑧ 我的成績單">
          <Scorecard market="tw" />
        </Section>
      </Why>
    </div>
  );
}
