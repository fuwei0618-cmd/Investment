import Link from "next/link";
import { connection } from "next/server";
import LightDot from "@/components/Light";
import { SEASON_TOOLS, taipeiToday, upcoming, type Verdict } from "@/lib/desk";
import type { PhaseKey } from "@/lib/industry";
import { getSeries } from "@/lib/fred";
import { getTodayAnswers } from "@/lib/todayData";
import { usdLevel, usdStats } from "@/lib/usd";
import QCard from "./QCard";
import SellCard from "./SellCard";

// 台股、美股實戰頁共用的外框和兩段（總體經濟、行事曆）

export const box =
  "space-y-3 rounded-2xl bg-[#fffdf8] p-4 shadow-[0_1px_2px_rgba(60,40,10,.06),0_6px_16px_rgba(60,40,10,.08)] dark:bg-[#221d16]";
export const more = "text-sm text-blue-700 underline dark:text-blue-400";
export const wait = <p className="text-sm text-stone-500">讀取中⋯⋯</p>;
export const sign = (n: number, d = 0) => `${n > 0 ? "+" : ""}${n.toFixed(d)}`;

export function Section({
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
          className={`rounded-full px-4 py-1 ${id === now ? "bg-[#b4651e] text-white" : "bg-[#f3ead8] dark:bg-[#2f281f]"}`}
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
      {s && (
        <p className="rounded-xl bg-[#f3ead8] px-3 py-2 text-sm dark:bg-[#2f281f]">
          現在是景氣<b>{s.name}期</b>，這一季最適合的工具：
          <b>{s.tools}</b>。{s.why}
          <Link href="/tools" className={`ml-1 ${more}`}>
            看六種放法 →
          </Link>
        </p>
      )}
    </div>
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
          大盤、景氣、產業、大事、追蹤清單、名單、持股和 LINE 設定都在這裡
        </span>
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  );
}
