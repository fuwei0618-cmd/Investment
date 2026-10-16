import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import LightDot from "@/components/Light";
import { hotStreets, mood, PLAYERS } from "@/lib/chips";
import { getChips, getStreets } from "@/lib/chipsData";
import { taipeiToday, upcoming, verdict } from "@/lib/desk";
import { getTaiex } from "@/lib/deskData";
import { getSeries } from "@/lib/fred";
import { getPicks, type PlayId } from "@/lib/pickData";
import { getTodayAnswers } from "@/lib/todayData";
import { usdLevel, usdStats } from "@/lib/usd";
import LiveBoard from "../go/daytrade/LiveBoard";
import { GO_PLAYS, HREF } from "../go/GoPage";
import Holdings from "./Holdings";
import TrackedNews from "./TrackedNews";

export const metadata = { title: "實戰｜投資羅盤" };

const box =
  "space-y-3 rounded-2xl bg-[#fffdf8] p-4 shadow-[0_1px_2px_rgba(60,40,10,.06),0_6px_16px_rgba(60,40,10,.08)] dark:bg-[#221d16]";
const more = "text-sm text-blue-700 underline dark:text-blue-400";
const wait = <p className="text-sm text-stone-500">讀取中⋯⋯</p>;
const sign = (n: number, d = 0) => `${n > 0 ? "+" : ""}${n.toFixed(d)}`;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={box}>
      <h2 className="text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}

// ① 今天能不能出手
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
        ? `加權指數 ${taiex.close.toFixed(0)}，月線 ${taiex.ma.toFixed(0)}，${taiex.above ? "在上面" : "在下面"}。`
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
async function Macro() {
  await connection();
  const [t, usd] = await Promise.all([getTodayAnswers(), getSeries("DEXTAUS")]);
  const u = usd ? usdStats(usd) : null;
  const rows = [
    { q: "世界景氣好嗎？", a: t.economy, href: "/market#level-1" },
    { q: "錢變多還是變少？", a: t.money, href: "/market#level-2" },
    { q: "現在是哪一季？", a: t.season, href: "/market#level-3" },
  ];
  return (
    <>
      <ul className="space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.q} className="flex items-start gap-2">
            <span className="mt-1">
              <LightDot light={r.a?.light ?? null} />
            </span>
            <span>
              <b>{r.q}</b> {r.a?.answer ?? "今天的數字暫時抓不到"}
              {r.a && (
                <span className="block text-xs text-stone-500">
                  {r.a.reasons.join("；")}
                </span>
              )}
              <Link
                href={r.href}
                className="ml-1 text-xs text-blue-700 underline dark:text-blue-400"
              >
                看為什麼
              </Link>
            </span>
          </li>
        ))}
        <li className="flex items-start gap-2">
          <span className="mt-1">
            <LightDot light={null} />
          </span>
          <span>
            <b>美元貴不貴？</b>{" "}
            {u
              ? `1 美元換 ${u.now.toFixed(2)} 台幣（${u.date}），在過去 10 年算「${usdLevel(u.pct).word}」。台幣變強時，外資比較會買台股。`
              : "今天的匯率暫時抓不到"}
            <Link
              href="/usd"
              className="ml-1 text-xs text-blue-700 underline dark:text-blue-400"
            >
              看美元專區
            </Link>
          </span>
        </li>
      </ul>
      <p className="text-xs text-stone-500">
        這幾個數字一個月才變一次，不用每天看，知道現在是什麼天氣就好。
      </p>
    </>
  );
}

// ③ 市場情況
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
async function Calendar() {
  await connection();
  const today = taipeiToday();
  const list = upcoming(today, 30);
  return (
    <>
      <h3 className="font-bold">接下來 30 天的行事曆</h3>
      <ul className="space-y-1.5 text-sm">
        {list.map((e) => (
          <li
            key={e.date + e.name}
            className={`rounded-xl px-3 py-2 ${e.date === today ? "bg-amber-100 dark:bg-amber-950" : "bg-[#f3ead8] dark:bg-[#2f281f]"}`}
          >
            <b>
              {e.date === today ? "今天" : e.date.slice(5).replace("-", "/")}
              {e.rough && "前後"}　{e.name}
            </b>
            <span className="block text-stone-600 dark:text-stone-400">
              {e.why}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-500">
        標「前後」的是每月大約的時間，確切日子以官方公布為準。
      </p>
    </>
  );
}

// ⑥ 今天的策略卡名單
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
        <p className="text-sm text-stone-600 dark:text-stone-400">
          每天開盤前看這一頁就好：先看能不能出手，再看天氣、市場和大事，最後看自己追蹤的股票和持股。
        </p>
        <nav className="flex flex-wrap gap-1.5 text-xs">
          {[
            ["go", "能不能出手"],
            ["macro", "總體經濟"],
            ["market", "市場情況"],
            ["news", "必知大事"],
            ["watch", "追蹤清單"],
            ["picks", "策略卡名單"],
            ["hold", "持股提醒"],
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
      </header>
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
          <Calendar />
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
      </Section>
    </div>
  );
}
