import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import LightDot from "@/components/Light";
import { closeAndMa } from "@/lib/desk";
import { getSeries } from "@/lib/fred";
import { getTodayAnswers } from "@/lib/todayData";
import {
  aboveMa20,
  changeOver,
  fearLight,
  US_INDICES,
  US_SECTORS,
  usVerdict,
} from "@/lib/us";
import { getUsBars, getUsPicks } from "@/lib/usData";
import { usdLevel, usdStats } from "@/lib/usd";
import LiveBoard from "../../go/daytrade/LiveBoard";
import Holdings from "../Holdings";
import Scorecard from "../Scorecard";
import LineSetup from "../LineSetup";
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
} from "../parts";

export const metadata = { title: "美股實戰｜投資羅盤" };

// 最上面：今晚買不買、買哪一檔、手上哪檔要賣，加一行這一季適合的工具
async function Top() {
  await connection();
  const [bars, t, picks] = await Promise.all([
    getUsBars(["^GSPC", "^VIX"]),
    getTodayAnswers(),
    getUsPicks(),
  ]);
  const spx = aboveMa20(bars["^GSPC"]);
  const v = usVerdict({
    above: spx?.above ?? null,
    vix: bars["^VIX"].at(-1)?.close ?? null,
    season: t.season?.light ?? null,
  });
  const x = "picks" in picks ? picks.picks.find((p) => p.pass) : undefined;
  return (
    <TopThree
      v={v}
      pick={
        x
          ? {
              name: x.name,
              code: x.code,
              href: "/go/us-stock",
              note: `三個條件全過（強勢股突破），收 ${Math.round(x.close * 100) / 100} 美元。`,
            }
          : null
      }
      phase={t.season?.phase ?? null}
      market="us"
    />
  );
}

const pct = (n: number | null, d = 1) =>
  n == null ? "—" : `${sign(n * 100, d)}%`;
const tone = (n: number | null) =>
  n == null
    ? ""
    : n >= 0
      ? "text-red-700 dark:text-red-400"
      : "text-green-700 dark:text-green-400";

// ① 今天能不能出手（美股）：標普 500 在月線上嗎、景氣季節、美元
async function Go() {
  await connection();
  const [bars, t, usd] = await Promise.all([
    getUsBars(["^GSPC", "^VIX"]),
    getTodayAnswers(),
    getSeries("DEXTAUS"),
  ]);
  const spx = aboveMa20(bars["^GSPC"]);
  const vix = bars["^VIX"].at(-1)?.close ?? null;
  const fear = fearLight(vix);
  const v = usVerdict({
    above: spx?.above ?? null,
    vix,
    season: t.season?.light ?? null,
  });
  const u = usd ? usdStats(usd) : null;
  const rows = [
    {
      q: "標普 500 在月線上嗎？",
      light: spx ? (spx.above ? "green" : "red") : null,
      a: spx
        ? `標普 500 收 ${closeAndMa(spx.close, spx.ma).join("，月線 ")}，${spx.above ? "在上面" : "在下面"}。`
        : "暫時抓不到",
    },
    {
      q: "市場怕不怕？",
      light: fear,
      a:
        vix == null
          ? "暫時抓不到"
          : `恐慌指數 ${vix.toFixed(1)}（20 以下算平靜，30 以上是大家在逃）。`,
    },
    {
      q: "景氣在哪一季？",
      light: t.season?.light ?? null,
      a: t.season?.answer ?? "暫時抓不到",
    },
    {
      q: "現在換美元划算嗎？",
      light: null,
      a: u
        ? `1 美元換 ${u.now.toFixed(2)} 台幣，在過去 10 年算「${usdLevel(u.pct).word}」。美元偏貴時分批換，不要一次換完。`
        : "匯率暫時抓不到",
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
        美國沒有每天公布法人買賣，所以「大戶在不在」改看恐慌指數：大家越怕，越少人敢買。
      </p>
    </>
  );
}

// ③ 市場情況（美股）：四個指數、11 個產業誰最強
async function Market() {
  await connection();
  const syms = [...US_INDICES.map((x) => x[0]), ...US_SECTORS.map((x) => x[0])];
  const bars = await getUsBars(syms);
  const sectors = US_SECTORS.map(([s, name]) => ({
    s,
    name,
    w1: changeOver(bars[s], 5),
    m1: changeOver(bars[s], 21),
  })).sort((a, b) => (b.m1 ?? -9) - (a.m1 ?? -9));
  const last = bars["^GSPC"].at(-1)?.date ?? "—";
  return (
    <>
      <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {US_INDICES.map(([s, name]) => {
          const b = bars[s];
          const d = changeOver(b, 1);
          return (
            <li
              key={s}
              className="rounded-xl bg-[#f3ead8] p-2.5 dark:bg-[#2f281f]"
            >
              <span className="block text-xs text-stone-500">{name}</span>
              <b className="text-lg">
                {b.at(-1)?.close.toFixed(s === "^VIX" ? 1 : 0) ?? "—"}
              </b>{" "}
              <span className={tone(d)}>{pct(d, 2)}</span>
            </li>
          );
        })}
      </ul>
      <h3 className="font-bold">哪一條街最強（近一個月漲跌，資料日 {last}）</h3>
      <ol className="space-y-1 text-sm">
        {sectors.map((x, i) => (
          <li key={x.s} className="flex items-baseline gap-2">
            <b className="w-5 text-stone-500">{i + 1}</b>
            <span className="w-24">{x.name}</span>
            <span className={`w-16 ${tone(x.m1)}`}>{pct(x.m1)}</span>
            <span className="text-xs text-stone-500">
              近一週 {pct(x.w1)}・{x.s}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-stone-500">
        錢流向前面幾條街，策略卡名單裡屬於這些產業的股票比較容易繼續漲。排最後的街先避開。
      </p>
    </>
  );
}

// ⑥ 今天的策略卡名單（強勢股突破）
async function Picks() {
  await connection();
  const d = await getUsPicks();
  if ("error" in d)
    return (
      <p className="text-sm text-stone-500">名單暫時抓不到（{d.error}）。</p>
    );
  const passed = d.picks.filter((x) => x.pass).slice(0, 5);
  const near = d.picks
    .filter((x) => !x.pass && x.score === 2)
    .slice(0, 5 - passed.length);
  return (
    <div className="space-y-2 rounded-xl bg-[#f3ead8] p-3 text-sm dark:bg-[#2f281f]">
      <b className="text-base">強勢股突破（資料日 {d.date}）</b>
      <ul className="space-y-1">
        {passed.map((x) => (
          <li key={x.code}>
            <span className="text-red-700 dark:text-red-400">
              三個條件全過　
            </span>
            <b>{x.name}</b> {x.code}　收 {Math.round(x.close * 100) / 100}　量{" "}
            {x.volRatio.toFixed(1)} 倍
          </li>
        ))}
        {near.map((x) => (
          <li key={x.code} className="text-stone-600 dark:text-stone-400">
            差一點（過 2 個）　{x.name} {x.code}
          </li>
        ))}
        {!passed.length && !near.length && (
          <li className="text-stone-500">今天沒有候選，不用硬買。</li>
        )}
      </ul>
      <Link href="/go/us-stock" className={more}>
        帶我做 →
      </Link>
    </div>
  );
}

export default function DeskUs() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-black">實戰</h1>
        <MarketSwitch now="us" />
        <p className="text-sm text-stone-600 dark:text-stone-400">
          美股在台灣晚上開盤（21:30，11 月到 3 月是 22:30）。晚上 21:00
          看最上面三個問題決定要不要買；想知道為什麼，再打開下面的「為什麼？」。
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
            <Calendar market="us" />
          </Suspense>
        </Section>
        <Section id="watch" title="⑤ 我的追蹤清單">
          <LiveBoard suggest={[]} market="us" />
        </Section>
        <Section id="picks" title="⑥ 今天的策略卡名單">
          <Suspense fallback={wait}>
            <Picks />
          </Suspense>
        </Section>
        <Section id="hold" title="⑦ 我的持股提醒">
          <Holdings market="us" />
          <LineSetup />
        </Section>
        <Section id="score" title="⑧ 我的成績單">
          <Scorecard market="us" />
        </Section>
      </Why>
    </div>
  );
}
