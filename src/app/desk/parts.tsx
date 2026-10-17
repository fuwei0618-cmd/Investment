import Link from "next/link";
import { connection } from "next/server";
import LightDot from "@/components/Light";
import { SEASON_TOOLS, taipeiToday, upcoming, type Verdict } from "@/lib/desk";
import type { PhaseKey } from "@/lib/industry";
import { getSeries } from "@/lib/fred";
import { getTodayAnswers } from "@/lib/todayData";
import { usdLevel, usdStats } from "@/lib/usd";
import Jump from "./Jump";
import QCard from "./QCard";
import { ScoreLine } from "./Scorecard";
import SellCard from "./SellCard";

// 台股、美股實戰頁共用的外框和兩段（總體經濟、行事曆）

export const box =
  "space-y-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(20,25,30,.06),0_6px_16px_rgba(20,25,30,.08)] dark:bg-[#1f2328]";
export const more = "text-sm text-blue-700 underline dark:text-blue-400";
export const wait = <p className="text-sm text-stone-500">讀取中⋯⋯</p>;
export const sign = (n: number, d = 0) => `${n > 0 ? "+" : ""}${n.toFixed(d)}`;

/** 每一區開頭那一句：第幾步、幫你做什麼、多久看一次。主要＝直接幫你賺錢，背景＝幫主要那幾區做判斷 */
const NOTE: Record<string, { main: boolean; text: string }> = {
  go: { main: true, text: "第 1 步。擋掉大盤往下時亂買。每天看。" },
  macro: {
    main: false,
    text: "第 1 步的背景。決定這一季用哪種工具。一個月看一次就好。",
  },
  market: {
    main: false,
    text: "第 2 步的背景。挑股票時偏向強的產業。一週看一次。",
  },
  news: {
    main: false,
    text: "第 1 步的背景。避開大起大落的日子。每天掃一眼。",
  },
  watch: { main: false, text: "第 2 步之前。想買的先放這裡等買點。想看再看。" },
  picks: {
    main: true,
    text: "第 2 步。找到買點，按「帶我做」接第 3、4 步。每天看。",
  },
  hold: {
    main: true,
    text: "第 5、6 步。停住賠的、守住賺的。LINE 會傳，不用一直開。",
  },
  score: {
    main: true,
    text: "第 6 步之後。看跟著網站做到底有沒有賺。賣掉一筆看一次。",
  },
};

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const n = NOTE[id];
  return (
    <section
      id={id}
      className={`${box} scroll-mt-20 border-t-4 ${n?.main ? "border-emerald-600" : "border-stone-300 dark:border-stone-600"}`}
    >
      <h2 className="text-xl font-black">{title}</h2>
      {n && (
        <p className="flex items-baseline gap-2 rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm dark:border-stone-700">
          <span
            className={`shrink-0 rounded-full px-2 text-xs font-bold text-white ${n.main ? "bg-emerald-600" : "bg-stone-500"}`}
          >
            {n.main ? "主要" : "背景"}
          </span>
          {n.text}
        </p>
      )}
      {children}
    </section>
  );
}

// ① 今天能不能出手
export async function Macro() {
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
export async function Calendar({ market }: { market: "tw" | "us" }) {
  await connection();
  const today = taipeiToday();
  const list = upcoming(today, 30, market);
  return (
    <>
      <h3 className="font-bold">接下來 30 天的行事曆</h3>
      <ul className="space-y-1.5 text-sm">
        {list.map((e) => (
          <li
            key={e.date + e.name}
            className={`rounded-xl px-3 py-2 ${e.date === today ? "bg-amber-100 dark:bg-amber-950" : "bg-[#e9e9e4] dark:bg-[#2a2e34]"}`}
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

/** 頁面最上面的「台股｜美股」切換 */
export function MarketSwitch({ now }: { now: "tw" | "us" }) {
  return (
    <nav className="flex gap-1.5 text-sm font-bold">
      {(
        [
          ["tw", "台股", "/desk"],
          ["us", "美股", "/desk/us"],
        ] as const
      ).map(([id, label, href]) => (
        <Link
          key={id}
          href={href}
          aria-current={id === now ? "page" : undefined}
          className={`rounded-full px-4 py-1 ${id === now ? "bg-[#1f2328] text-white dark:bg-[#e8edf3] dark:text-[#1f2328]" : "bg-[#e9e9e4] dark:bg-[#2a2e34]"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

/* ── 最上面：每天只回答三個問題，加一行這一季適合的工具 ── */

export function TopThree({
  v,
  pick,
  phase,
  market,
}: {
  v: Verdict;
  pick: { name: string; code: string; href: string; note: string } | null;
  phase: PhaseKey | null;
  market: "tw" | "us";
}) {
  const s = phase ? SEASON_TOOLS[phase] : null;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <QCard q="今天買不買？" tone={v.light}>
          <p className="text-xl font-black">{v.title}</p>
          <p className="text-sm">{v.todo}</p>
        </QCard>
        <QCard
          q="買哪一檔？"
          tone={v.light === "red" || !pick ? null : "green"}
        >
          {v.light === "red" ? (
            <>
              <p className="text-xl font-black">今天先不買</p>
              <p className="text-sm">大盤在月線下，名單先不用看。</p>
            </>
          ) : pick ? (
            <>
              <p className="text-xl font-black">
                {pick.name} {pick.code}
              </p>
              <p className="text-sm">
                {pick.note}
                <Link href={pick.href} className={`ml-1 ${more}`}>
                  帶我做 →
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-black">沒有全過的</p>
              <p className="text-sm">今天沒有三個條件全過的股票，不用硬買。</p>
            </>
          )}
        </QCard>
        <SellCard market={market} />
      </div>
      <ScoreLine market={market} />
      {s && (
        <p className="rounded-xl bg-[#e9e9e4] px-3 py-2 text-sm dark:bg-[#2a2e34]">
          現在是景氣<b>{s.name}期</b>，這一季最適合的工具：
          <b>{s.tools}</b>。{s.why}
          <span className="ml-1">
            看卡：
            <Cards cards={s.cards} market={market} />
          </span>
        </p>
      )}
      <DeskMap phase={phase} market={market} />
    </div>
  );
}

/** 四季卡上的工具，各自連到工具頁那一張卡 */
function Cards({
  cards,
  market,
}: {
  cards: [string, string][];
  market: "tw" | "us";
}) {
  return cards.map(([label, id], i) => (
    <span key={id}>
      {i > 0 && "、"}
      <Link
        href={`/tools#${id === "stock" ? `${market}-stock` : id}`}
        className={more}
      >
        {label}
      </Link>
    </span>
  ));
}

const STEPS: { what: string; where: React.ReactNode }[] = [
  {
    what: "能不能出手？大盤在月線上才買",
    where: (
      <>
        看 <Jump to="go">① 能不能出手</Jump>，背景在 ②③④
      </>
    ),
  },
  {
    what: "買哪一檔？策略卡三個條件全過",
    where: (
      <>
        看 <Jump to="picks">⑥ 策略卡名單</Jump>，想買的先放{" "}
        <Jump to="watch">⑤</Jump>
      </>
    ),
  },
  { what: "買多少？每筆最多一成", where: "按名單上的「帶我做」幫你算" },
  { what: "下單：照小抄在券商軟體掛單", where: "一樣在「帶我做」裡" },
  {
    what: "盯停損停利",
    where: (
      <>
        <Jump to="hold">⑦ 持股提醒</Jump>，LINE 會傳
      </>
    ),
  },
  {
    what: "賣掉，記下來",
    where: (
      <>
        在 ⑦ 按「賣掉了」，成績進 <Jump to="score">⑧ 成績單</Jump>
      </>
    ),
  },
];

/** 這頁怎麼用：一筆交易的六步，加景氣四季各用什麼工具。平常收起來 */
function DeskMap({
  phase,
  market,
}: {
  phase: PhaseKey | null;
  market: "tw" | "us";
}) {
  return (
    <details className="group rounded-2xl bg-white shadow-[0_1px_2px_rgba(20,25,30,.06),0_6px_16px_rgba(20,25,30,.08)] dark:bg-[#1f2328]">
      <summary className="cursor-pointer list-none px-4 py-2.5 font-bold">
        這頁怎麼用（地圖）
        <span className="ml-1 group-open:hidden">▸</span>
        <span className="ml-1 hidden group-open:inline">▾</span>
      </summary>
      <div className="space-y-4 px-4 pb-4">
        <div className="space-y-2">
          <h3 className="font-bold">一筆交易只有六步</h3>
          <ol className="grid gap-1.5 md:grid-cols-2">
            {STEPS.map((x, i) => (
              <li
                key={x.what}
                className="grid grid-cols-[1.5em_1fr] gap-x-2 rounded-xl bg-[#f2f2ee] px-3 py-2 text-sm dark:bg-[#2a2e34]"
              >
                <span className="font-black">{i + 1}</span>
                <span>{x.what}</span>
                <span className="col-start-2 text-xs text-stone-600 dark:text-stone-400">
                  {x.where}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold">景氣四季，各用什麼工具</h3>
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
            {(Object.keys(SEASON_TOOLS) as PhaseKey[]).map((k) => {
              const t = SEASON_TOOLS[k];
              return (
                <div
                  key={k}
                  className={`space-y-0.5 rounded-xl bg-[#f2f2ee] px-3 py-2 text-sm dark:bg-[#2a2e34] ${k === phase ? "ring-2 ring-emerald-600" : ""}`}
                >
                  {k === phase && (
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      現在
                    </p>
                  )}
                  <p className="font-black">{t.name}</p>
                  <p>{t.tools}</p>
                  <p className="text-xs">
                    看卡：
                    <Cards cards={t.cards} market={market} />
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-stone-500">
            景氣四季是提高勝率的方法，不保證每一季都賺。
          </p>
        </div>
      </div>
    </details>
  );
}

/** 原本七區的詳細資料：平常收起來，想知道為什麼再打開 */
export function Why({ children }: { children: React.ReactNode }) {
  return (
    <details className="group space-y-4">
      <summary className="cursor-pointer list-none rounded-xl border-2 border-dashed border-stone-300 px-3 py-2 text-sm font-bold text-stone-600 dark:border-stone-600 dark:text-stone-300">
        <span className="group-open:hidden">▸ 為什麼？</span>
        <span className="hidden group-open:inline">▾ 收起來</span>
        <span className="ml-1 font-normal">
          大盤、景氣、產業、大事、追蹤清單、名單、持股、成績單和 LINE
          設定都在這裡
        </span>
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  );
}
