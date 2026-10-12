import { Suspense } from "react";
import Crumb from "@/components/Crumb";
import LineChart from "@/components/LineChart";
import { getSeries } from "@/lib/fred";
import { applyTransform } from "@/lib/macro";
import { TW_RATE, USD_MEANINGS, clientTalk, usdLevel, usdStats } from "@/lib/usd";
import ClientTalk from "./ClientTalk";

const TONE = {
  red: "text-red-600 dark:text-red-400",
  amber: "text-amber-600 dark:text-amber-400",
  zinc: "text-zinc-700 dark:text-zinc-200",
  sky: "text-sky-600 dark:text-sky-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
};

async function UsdBoard() {
  const [twd, fed, dxy] = await Promise.all([getSeries("DEXTAUS"), getSeries("FEDFUNDS"), getSeries("DTWEXBGS")]);
  const st = twd ? usdStats(twd) : null;
  const usRate = fed?.at(-1)?.value ?? null;
  const spread = usRate !== null ? usRate - TW_RATE.rate : null;
  const dxyYoy = dxy ? applyTransform(dxy, "yoyPct").at(-1) : undefined;
  const lvl = st ? usdLevel(st.pct) : null;
  const pos = st ? ((st.now - st.min) / (st.max - st.min || 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">現在 1 美元換多少台幣？</h2>
        {st && lvl ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-4xl font-semibold tabular-nums">{st.now.toFixed(2)}</span>
              <span className="text-sm text-zinc-500">元台幣（{st.date}）</span>
            </p>
            <p>
              比過去 10 年 <strong>{st.pct}%</strong> 的日子貴，算<strong className={TONE[lvl.tone]}>{lvl.word}</strong>。
              {st.yearAgo !== null && (
                <span className="text-zinc-600 dark:text-zinc-400">
                  {" "}
                  一年前是 {st.yearAgo.toFixed(2)}，{st.now >= st.yearAgo ? "美元變貴" : "美元變便宜"}了 {Math.abs(st.now - st.yearAgo).toFixed(2)} 元。
                </span>
              )}
            </p>
            <div>
              <div className="relative h-3 rounded-full bg-gradient-to-r from-emerald-200 via-zinc-200 to-red-300 dark:from-emerald-900 dark:via-zinc-700 dark:to-red-900">
                <span
                  className="animate-rise absolute -top-1 h-5 w-1.5 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-white"
                  style={{ left: `${Math.min(Math.max(pos, 2), 98)}%` }}
                />
              </div>
              <p className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>10 年最便宜 {st.min.toFixed(2)}</span>
                <span>平均 {st.avg.toFixed(2)}</span>
                <span>最貴 {st.max.toFixed(2)}</span>
              </p>
            </div>
            <LineChart series={twd!} label="1 美元換台幣" unit="元" digits={2} lines={[{ value: Number(st.avg.toFixed(2)), label: "10 年平均" }]} />
          </>
        ) : (
          <p className="text-sm text-zinc-500">匯率暫時抓不到，等一下再來看。</p>
        )}
        <p className="text-xs text-zinc-500">資料：美國聯準會 FRED（DEXTAUS），每週更新，會比銀行牌告晚幾天。</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">💰 美國利息比台灣高多少？</h2>
          {spread !== null ? (
            <>
              <p className="text-3xl font-semibold tabular-nums">
                {spread > 0 ? "+" : ""}
                {spread.toFixed(2)}
                <span className="text-base font-normal"> 個百分點</span>
              </p>
              <p className="text-sm">
                美國 {usRate!.toFixed(2)}% − 台灣 {TW_RATE.rate.toFixed(2)}%
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {spread > 0 ? "存美元比存台幣多拿這麼多利息，這就是錢想換成美元的原因。" : "美元利息沒有比較高，換美元就少了利息的好處。"}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">美國利率暫時抓不到。</p>
          )}
          <p className="text-xs text-zinc-500">兩邊都是央行的政策利率，銀行實際的美元定存利率會不一樣。台灣：央行 {TW_RATE.date} 決議。</p>
        </div>
        <div className="space-y-1 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">🌊 美元對全世界是強是弱？</h2>
          {dxyYoy ? (
            <>
              <p className="text-3xl font-semibold tabular-nums">
                {dxyYoy.value > 0 ? "+" : ""}
                {dxyYoy.value.toFixed(1)}%
              </p>
              <p className="text-sm">比去年{dxyYoy.value > 0 ? "變強" : "變弱"}（{dxyYoy.date}）</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {dxyYoy.value > 3 ? "美元明顯變強，錢流回美國，新興市場要小心。" : dxyYoy.value < -3 ? "美元明顯變弱，錢比較願意去美國以外的地方。" : "變化不大，美元不是現在的主角。"}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">美元指數暫時抓不到。</p>
          )}
          <p className="text-xs text-zinc-500">廣義美元指數，看美元對一籃子貨幣，跟第 2 關同一個數字。</p>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-semibold">🗣️ 客戶問「美元現在很貴，會不會換在高點？」</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">沒有人能保證匯率，所以這份說法不說「不會跌」，而是讓客戶看懂位置、用途和利息，自己覺得合理。數字會跟著今天的匯率更新。</p>
        <ClientTalk items={clientTalk(st, spread)} />
      </section>
    </div>
  );
}

export default function UsdPage() {
  return (
    <div className="space-y-6">
      <header>
        <Crumb href="/market#level-2" area="看市場" here="第 2 關延伸：美元" />
        <h1 className="text-2xl font-semibold">💵 美元專區</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">現在美元貴不貴、美國利息高多少，以及美元的漲跌在告訴你什麼。</p>
      </header>
      <Suspense fallback={<div className="h-60 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />}>
        <UsdBoard />
      </Suspense>
      <section className="space-y-3">
        <h2 className="font-semibold">美元除了匯率，還在告訴你什麼？</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {USD_MEANINGS.map((m, i) => (
            <li key={m.title} className="animate-rise rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="font-medium">
                {m.icon} {m.title}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">{m.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-xs text-zinc-500">課程：總經 2-2（股匯債的分配時機）、3-1（聯準會升息與資金流向）、3-5（新興市場危機）。</p>
    </div>
  );
}
