import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
const fmt = (n: number, digits = 0) => n.toLocaleString("zh-TW", { maximumFractionDigits: digits, minimumFractionDigits: digits });
import { cleanCode, instWord, isCode } from "@/lib/stock";
import { getStock } from "@/lib/stockData";
import StockForm from "./StockForm";

export const metadata = { title: "查一檔｜投資羅盤" };

const TONE = {
  good: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  meh: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  bad: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const signed = (n: number, digits = 0) => (n > 0 ? "+" : "") + fmt(n, digits);
const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

function Card({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-2 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

async function Result({ code }: { code: string }) {
  await connection();
  const s = await getStock(code);
  if ("error" in s) return <p className="text-sm text-red-600">{s.error}</p>;
  const w = instWord(s.inst);
  const v = s.verdict;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">
          {s.name}
          <span className="ml-2 text-sm font-normal text-zinc-500">
            {s.code}
            {s.industry && `・${s.industry}`}
          </span>
        </h2>
        {s.price && (
          <p className="tabular-nums">
            {fmt(s.price.close, 2)}
            {s.price.change !== null && (
              <span className={`ml-2 text-sm ${s.price.change >= 0 ? "text-red-600" : "text-emerald-600"}`}>
                {signed(s.price.change, 2)}%
              </span>
            )}
            <span className="ml-2 text-xs text-zinc-500">{md(s.price.date)} 收盤</span>
          </p>
        )}
      </div>

      <section className={`animate-rise rounded-md p-3 ${TONE[v.tag[0]]}`}>
        <p className="text-lg font-semibold">
          {v.em} {v.title}
          <span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-xs dark:bg-black/30">{v.tag[1]}</span>
        </p>
        <p className="mt-1 text-sm">{v.why}</p>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        <Card title="👥 外資、投信在排隊嗎">
          <p className={`rounded px-2 py-1 text-xs ${TONE[w.tone]}`}>{w.text}</p>
          {s.inst.days.length ? (
            <table className="w-full text-xs tabular-nums">
              <thead className="text-zinc-500">
                <tr>
                  <th className="text-left font-normal">日期</th>
                  <th className="text-right font-normal">外資（張）</th>
                  <th className="text-right font-normal">投信（張）</th>
                </tr>
              </thead>
              <tbody>
                {s.inst.days.map((d) => (
                  <tr key={d.date}>
                    <td>{md(d.date)}</td>
                    <td className={`text-right ${d.foreign > 0 ? "text-red-600" : d.foreign < 0 ? "text-emerald-600" : ""}`}>{signed(d.foreign)}</td>
                    <td className={`text-right ${d.trust > 0 ? "text-red-600" : d.trust < 0 ? "text-emerald-600" : ""}`}>{signed(d.trust)}</td>
                  </tr>
                ))}
                <tr className="border-t border-zinc-200 font-medium dark:border-zinc-800">
                  <td>十天合計</td>
                  <td className="text-right">{signed(s.inst.foreign.total)}</td>
                  <td className="text-right">{signed(s.inst.trust.total)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-zinc-500">法人資料抓不到。</p>
          )}
          <p className="text-xs text-zinc-500">連買三天以上才算有意思；兩邊同方向比只有一邊強。</p>
        </Card>

        <Card title="🪙 一股賺多少（EPS）">
          {s.eps.last4.length ? (
            <>
              <table className="w-full text-xs tabular-nums">
                <tbody>
                  {s.eps.last4.map((q) => (
                    <tr key={q.date}>
                      <td>{q.date.slice(0, 7)} 那一季</td>
                      <td className="text-right">{fmt(q.eps, 2)} 元</td>
                    </tr>
                  ))}
                  {s.eps.ttm !== null && (
                    <tr className="border-t border-zinc-200 font-medium dark:border-zinc-800">
                      <td>最近四季合計</td>
                      <td className="text-right">{fmt(s.eps.ttm, 2)} 元</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <ul className="space-y-1 text-xs">
                {s.eps.growth !== null && (
                  <li>
                    越賺越多嗎：四季合計比前四季{" "}
                    <b className={s.eps.growth >= 0 ? "text-red-600" : "text-emerald-600"}>{signed(s.eps.growth, 1)}%</b>
                  </li>
                )}
                {s.eps.yoy !== null && (
                  <li>
                    最新一季比去年同季 <b className={s.eps.yoy >= 0 ? "text-red-600" : "text-emerald-600"}>{signed(s.eps.yoy, 1)}%</b>
                  </li>
                )}
                {s.revenue && (
                  <li>
                    越賣越多嗎：{s.revenue.month} 月營收比去年同月{" "}
                    <b className={s.revenue.yoy >= 0 ? "text-red-600" : "text-emerald-600"}>{signed(s.revenue.yoy, 1)}%</b>
                  </li>
                )}
              </ul>
            </>
          ) : (
            <p className="text-xs text-zinc-500">財報抓不到。</p>
          )}
        </Card>

        <Card title="⏳ 幾年回本（本益比）比平常貴嗎">
          {s.pe ? (
            <>
              <p>
                現在 <b className="tabular-nums">{fmt(s.pe.now, 1)}</b> 倍
                <span className="ml-1 text-xs text-zinc-500">（{md(s.pe.date)}）</span>
              </p>
              <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="absolute h-2 rounded-full bg-amber-300 dark:bg-amber-600"
                  style={{ left: `${((s.pe.low - s.pe.min) / (s.pe.max - s.pe.min)) * 100}%`, width: `${((s.pe.high - s.pe.low) / (s.pe.max - s.pe.min)) * 100}%` }}
                />
                <div className="absolute -top-1 h-4 w-1 rounded bg-zinc-900 dark:bg-zinc-100" style={{ left: `${((s.pe.now - s.pe.min) / (s.pe.max - s.pe.min)) * 100}%` }} />
              </div>
              <p className="flex justify-between text-xs text-zinc-500 tabular-nums">
                <span>五年最低 {fmt(s.pe.min, 1)}</span>
                <span>平常 {fmt(s.pe.low, 1)}–{fmt(s.pe.high, 1)}</span>
                <span>最高 {fmt(s.pe.max, 1)}</span>
              </p>
              <p className={`rounded px-2 py-1 text-xs ${TONE[s.pe.level === "cheap" ? "good" : s.pe.level === "pricey" ? "bad" : "meh"]}`}>
                {s.pe.level === "cheap" ? "比它自己平常便宜" : s.pe.level === "pricey" ? "比它自己平常貴" : "在平常的範圍裡"}，比過去 {fmt(s.pe.rank * 100)}% 的日子貴。
              </p>
            </>
          ) : (
            <p className="text-xs text-zinc-500">本益比資料抓不到（新上市或虧損的公司常沒有）。</p>
          )}
          <p className="text-xs text-zinc-500">黃色是它平常的範圍（五年平均加減一個標準差），黑線是現在。</p>
        </Card>
      </div>

      {s.missing.length > 0 && <p className="text-xs text-zinc-500">抓不到：{s.missing.join("、")}。等一下再查，或用問 AI 補。</p>}
      <p className="text-xs text-zinc-500">
        想知道為什麼這樣判斷：看市場第 6 關「哪家是冠軍」和第 7 關「值多少錢」，或去{" "}
        <Link href="/game/bakery.html" className="underline">
          麵包店大富翁
        </Link>{" "}
        玩一圈。
      </p>
    </div>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code: raw } = await searchParams;
  const code = cleanCode(raw ?? "");
  return (
    <>
      <StockForm initial={code} />
      {isCode(code) ? (
        <Suspense fallback={<div className="h-48 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />}>
          <Result code={code} />
        </Suspense>
      ) : (
        <p className="text-sm text-zinc-500">例如玉晶光打 3406、大立光打 3008、台積電打 2330。</p>
      )}
    </>
  );
}

export default function StockPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">🔍 查一檔</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">叔叔報了名牌？打股號，一頁看外資投信、賺多少、貴不貴，最後給你麵包店那一格的結論。</p>
      </div>
      <Suspense fallback={<div className="h-10 w-56 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
