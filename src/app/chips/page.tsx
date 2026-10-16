import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import Crumb from "@/components/Crumb";
import LightDot from "@/components/Light";
import { PLAYERS, hotStreets, mood, story, streak, type Day } from "@/lib/chips";
import { getChips, getStreets } from "@/lib/chipsData";
import Guess from "./Guess";
import StreetMap from "./StreetMap";

export const metadata = { title: "麵包鎮的大戶｜投資羅盤" };

const paper = "rounded-2xl bg-[#fffdf8] p-3 shadow-[0_1px_2px_rgba(60,40,10,.06),0_6px_16px_rgba(60,40,10,.08)] dark:bg-[#221d16]";
const chip = "rounded-xl bg-[#f3ead8] p-2.5 dark:bg-[#2f281f]";
const yi = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(0)} 億`;
// 台股習慣：紅色是買（漲）、綠色是賣（跌）
const UP = "text-red-600 dark:text-red-400";
const DOWN = "text-emerald-700 dark:text-emerald-400";
const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

const SCENE_BG = ["bg-sky-50 dark:bg-sky-950/40", "bg-amber-50 dark:bg-amber-950/40", "bg-violet-50 dark:bg-violet-950/40", "bg-rose-50 dark:bg-rose-950/40"];
const MOOD_BG = { green: "bg-emerald-50 dark:bg-emerald-950/40", yellow: "bg-amber-50 dark:bg-amber-950/40", red: "bg-red-50 dark:bg-red-950/40" };

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-16 font-semibold">
      {children}
    </h2>
  );
}

// 每天收盤後的真資料：劇場、氣氛燈、逛街地圖、猜猜明天、今天的數字
async function Live() {
  await connection(); // 每次開頁都拿最新的，不在建置時固定
  const [data, map] = await Promise.all([getChips(), getStreets()]);
  if (!data || data.days.length === 0)
    return <p className={`${chip} text-sm text-stone-500`}>今天的大戶資料暫時抓不到，等一下再來看。收盤後大約下午三點半會更新。</p>;
  const { days, margin } = data;
  const last = days.at(-1)!;
  const scenes = story(days, margin, map ? hotStreets(map.streets) : undefined);
  const m = mood(days, margin?.change ?? null);
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <H id="theater">🎭 今日大戶劇場・{md(last.date)}</H>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {scenes.map((sc, i) => (
            <li key={i} className={`animate-rise relative rounded-2xl p-3 shadow-sm ${SCENE_BG[i]}`} style={{ animationDelay: `${i * 180}ms` }}>
              <span className="absolute right-2 top-1.5 text-xs font-black text-stone-400">{i + 1}</span>
              <span className="block text-4xl leading-none">{sc.icon}</span>
              <b className="mt-1.5 block">{sc.title}</b>
              <span className="text-sm">{sc.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {m && (
        <section className="space-y-2">
          <H id="mood">🚦 鎮上氣氛燈</H>
          <div className={`flex items-start gap-3 rounded-2xl p-3 ${MOOD_BG[m.light]}`}>
            <span className="mt-1.5">
              <LightDot light={m.light} />
            </span>
            <p className="text-sm">
              <b className="block text-lg font-black">{m.name}</b>
              {m.line}
              <span className="block text-xs text-stone-500">看外資和投信這五天加起來，再看鎮民有沒有追著借錢。首頁也看得到這顆燈。</span>
            </p>
          </div>
        </section>
      )}

      <section className="space-y-2">
        <H id="map">🗺️ 大戶逛街地圖{map ? `・${md(map.date)}` : ""}</H>
        {map ? <StreetMap streets={map.streets} /> : <p className={`${chip} text-sm text-stone-500`}>證交所的逛街資料暫時抓不到，等一下再來看。</p>}
      </section>

      <section className="space-y-2">
        <H id="guess">🔮 猜猜明天</H>
        <Guess days={days.map((d) => ({ date: d.date, foreign: d.net.foreign }))} />
      </section>

      <section className="space-y-2">
        <H id="numbers">📋 今天的數字</H>
        <Numbers days={days} margin={margin} />
      </section>
    </div>
  );
}

function Numbers({ days, margin }: { days: Day[]; margin: { date: string; today: number; change: number } | null }) {
  const last = days.at(-1)!;
  const max = Math.max(...days.map((d) => Math.abs(d.net.foreign)), 1);
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        {PLAYERS.map((p) => {
          const v = last.net[p.id];
          const s = streak(days, p.id);
          return (
            <div key={p.id} className={chip}>
              <p className="text-xs text-stone-500">
                {p.icon} {p.name}・{md(last.date)}
              </p>
              <p className={`text-xl font-black tabular-nums ${v >= 0 ? UP : DOWN}`}>
                {v >= 0 ? "買超" : "賣超"} {Math.abs(v).toFixed(0)} 億
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-400">{Math.abs(s) >= 2 ? `已經連續${s > 0 ? "買" : "賣"} ${Math.abs(s)} 天` : "方向還沒連續"}</p>
            </div>
          );
        })}
      </div>
      <div className={chip}>
        <p className="mb-1.5 text-xs text-stone-500">✈️ 外資最近 {days.length} 天（往右紅色是買、往左綠色是賣）</p>
        <ul className="space-y-1">
          {days.map((d) => {
            const v = d.net.foreign;
            const w = `${(Math.abs(v) / max) * 50}%`;
            return (
              <li key={d.date} className="grid grid-cols-[40px_1fr_64px] items-center gap-2 text-xs tabular-nums">
                <span className="text-stone-500">{md(d.date)}</span>
                <span className="relative h-3 rounded bg-white/60 dark:bg-black/20">
                  <span className="absolute inset-y-0 left-1/2 w-px bg-stone-400" />
                  <span
                    className={`absolute inset-y-0 rounded ${v >= 0 ? "left-1/2 bg-red-500" : "right-1/2 bg-emerald-500"}`}
                    style={{ width: w }}
                  />
                </span>
                <span className={`text-right ${v >= 0 ? UP : DOWN}`}>{yi(v)}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {margin && (
        <p className={`${chip} text-sm`}>
          🙋 鎮民借錢買（融資）：{md(margin.date)} 還欠 {margin.today.toLocaleString("zh-TW", { maximumFractionDigits: 0 })} 億，比前一天
          {margin.change >= 0 ? "多" : "少"} {Math.abs(margin.change).toFixed(0)} 億。
          <span className="block text-xs text-stone-500">大戶在賣、鎮民卻越借越多，常是要小心的時候。</span>
        </p>
      )}
      <p className="text-xs text-stone-500">資料：FinMind（整理自證交所）。單位億元，外資含外資自營商、自營商含避險。</p>
    </div>
  );
}

export default function ChipsPage() {
  return (
    <div className="space-y-4">
      <header>
        <Crumb href="/market" area="看市場" here="延伸：大戶在買什麼" />
        <h1 className="text-2xl font-semibold">👥 麵包鎮的大戶：法人與外資</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          店的價錢是買的人和賣的人喊出來的。錢多的人一動，價錢就跟著動。台股每天收盤後會公布這些大戶買了多少、賣了多少，專有名詞叫「籌碼」。
        </p>
      </header>

      <nav className="flex flex-wrap gap-1.5 text-sm">
        {[
          ["theater", "🎭 劇場"],
          ["mood", "🚦 氣氛燈"],
          ["map", "🗺️ 逛街地圖"],
          ["guess", "🔮 猜猜明天"],
          ["numbers", "📋 數字"],
          ["who", "👥 誰是大戶"],
        ].map(([id, name]) => (
          <a key={id} href={`#${id}`} className="rounded-full bg-[#f3ead8] px-3 py-1 font-semibold dark:bg-[#2f281f]">
            {name}
          </a>
        ))}
      </nav>

      <Suspense fallback={<p className={`${chip} text-sm text-stone-500`}>抓今天的資料中…</p>}>
        <Live />
      </Suspense>

      <section className="space-y-2">
        <H id="who">👥 鎮上有三種大戶（三大法人），加上一群鎮民</H>
        <ul className="grid gap-2 md:grid-cols-2">
          {PLAYERS.map((p) => (
            <li key={p.id} className={`${paper} flex gap-3`}>
              <span className="text-4xl leading-none">{p.icon}</span>
              <div className="min-w-0 space-y-1 text-sm">
                <p>
                  <b className="text-lg font-black">{p.name}</b>
                  <span className="ml-1.5 text-stone-500">＝{p.town}</span>
                  <span className="block text-xs text-amber-700 dark:text-amber-400">{p.term}</span>
                </p>
                <p>{p.how}</p>
                <p className="text-stone-600 dark:text-stone-400">👀 {p.watch}</p>
              </div>
            </li>
          ))}
          <li className={`${paper} flex gap-3`}>
            <span className="text-4xl leading-none">🙋</span>
            <div className="min-w-0 space-y-1 text-sm">
              <p>
                <b className="text-lg font-black">散戶</b>
                <span className="ml-1.5 text-stone-500">＝鎮上的一般人</span>
                <span className="block text-xs text-amber-700 dark:text-amber-400">個人投資人；融資、融券</span>
              </p>
              <p>融資＝跟券商借錢買店的股份；融券＝先借股份來賣，賭它會跌。</p>
              <p className="text-stone-600 dark:text-stone-400">👀 融資一直變多、價錢卻不漲，代表鎮民很熱，大戶可能正在賣給他們。</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <H id="tips">🔑 怎麼看才不會被騙</H>
        <ol className="grid gap-2 text-sm md:grid-cols-3">
          <li className={chip}>
            <b className="block">看連續，不看一天</b>
            一天的買賣可能只是調整。同一個方向連續五天以上才有意思。
          </li>
          <li className={chip}>
            <b className="block">看跟誰一起動</b>
            外資買超加上新台幣變強，代表錢真的流進台灣。兩個方向相反，就先別急。
          </li>
          <li className={chip}>
            <b className="block">大戶也會錯</b>
            跟著大戶買不是保證。他們錢多、忍得久，跌兩成還撐得住，你不一定。
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <H id="links">🧭 跟這個 App 哪裡有關</H>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li className={chip}>
            <Link href="/usd" className="font-bold text-blue-600">
              💵 美元專區 →
            </Link>
            <span className="block">外資賣台股要換回美元匯出去，所以新台幣突然變弱，常是外資在賣。</span>
          </li>
          <li className={chip}>
            <Link href="/tools#tw-stock" className="font-bold text-blue-600">
              🥐 工具卡：台股個股 →
            </Link>
            <span className="block">短線的撇步裡，「大戶連續買超」就是一個進場訊號，配停損一起用。</span>
          </li>
          <li className={chip}>
            <Link href="/market#level-6" className="font-bold text-blue-600">
              🔍 看市場第 6–8 關（挑店） →
            </Link>
            <span className="block">挑好店是看店本身賺不賺錢；大戶只告訴你現在誰在買，兩個一起看。</span>
          </li>
          <li className={chip}>
            <Link href="/courses" className="font-bold text-blue-600">
              📚 課程第六章：台股籌碼面分析 →
            </Link>
            <span className="block">AI Agent 投資系統實戰課 6-1 到 6-4：籌碼資料、融資融券與分點、三大法人與官股、期貨未平倉。</span>
          </li>
        </ul>
      </section>
      <p className="text-xs text-zinc-500">這頁是一般常識整理，不是投資建議。</p>
    </div>
  );
}
