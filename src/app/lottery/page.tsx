import { Suspense } from "react";
import { connection } from "next/server";
import { FEE, Phase, WIN_FEE, isNewListing, judge, priceLabel } from "@/lib/lottery";
import { getActive, todayTw } from "@/lib/lotteryData";

const PHASES: { key: Phase; title: string; empty: string }[] = [
  { key: "open", title: "🟢 現在可以抽", empty: "今天沒有正在申購的股票。" },
  { key: "soon", title: "🗓️ 快開始了", empty: "近期沒有公告要開始的申購。" },
  { key: "drawn", title: "🎲 等抽籤／剛抽完", empty: "最近兩週沒有抽籤結果。" },
];

const TONE = {
  good: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  meh: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  bad: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  unknown: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

const md = (d: string) => (d ? `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}` : "未定");
const money = (n: number) => n.toLocaleString("zh-TW");

async function Board() {
  await connection(); // 「今天」要在每次開頁時算，不能在建置時固定
  const today = todayTw();
  const rows = await getActive(today);
  if (!rows) return <p className="text-sm text-zinc-500">證交所的申購公告暫時抓不到，等一下再來看。</p>;
  const order = { good: 0, meh: 1, unknown: 2, bad: 3 };
  return (
    <div className="space-y-6">
      {PHASES.map((ph) => {
        const items = rows
          .filter((r) => r.phase === ph.key)
          .map((r) => ({ ...r, v: judge(r.l, r.close?.price ?? null) }))
          .sort((a, b) => order[a.v.tone] - order[b.v.tone] || a.l.end.localeCompare(b.l.end));
        return (
          <section key={ph.key} className="space-y-2">
            <h2 className="font-semibold">
              {ph.title}
              <span className="ml-2 text-sm font-normal text-zinc-500">{items.length} 檔</span>
            </h2>
            {items.length === 0 && <p className="text-sm text-zinc-500">{ph.empty}</p>}
            <ul className="space-y-2">
              {items.map(({ l, v, close }, i) => (
                <li key={l.code + l.draw} className="animate-rise space-y-1.5 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {l.name}
                      <span className="ml-1.5 text-xs font-normal text-zinc-500">
                        {l.code}・{l.market}
                      </span>
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${TONE[ph.key === "drawn" ? "unknown" : v.tone]}`}>
                      {ph.key === "drawn" ? "申購已截止" : v.word}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    申購 {md(l.start)}–{md(l.end)}・抽籤 {md(l.draw)}・上市 {md(l.listing)}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded bg-zinc-50 py-1.5 dark:bg-zinc-900">
                      <p className="text-xs text-zinc-500">承銷價</p>
                      <p className="font-medium tabular-nums">{l.price ?? "未定"}</p>
                    </div>
                    <div className="rounded bg-zinc-50 py-1.5 dark:bg-zinc-900">
                      <p className="text-xs text-zinc-500">{priceLabel(l, today)}</p>
                      <p className="font-medium tabular-nums">{close ? close.price : "—"}</p>
                    </div>
                    <div className="rounded bg-zinc-50 py-1.5 dark:bg-zinc-900">
                      <p className="text-xs text-zinc-500">抽中約賺</p>
                      <p className={`font-medium tabular-nums ${v.gain !== null && v.gain < 0 ? "text-red-600" : ""}`}>
                        {v.gain !== null ? money(v.gain) : "—"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {v.cost !== null && <>帳戶要先放 {money(v.cost)} 元。</>}
                    {v.pct !== null && <>{priceLabel(l, today)}比承銷價{v.pct >= 0 ? "高" : "低"} {Math.abs(v.pct).toFixed(1)}%。</>}
                    {v.breakEven !== null && <>中籤率高於 {v.breakEven < 0.01 ? "0.01" : v.breakEven.toFixed(2)}% 就划算。</>}
                    {isNewListing(l) && priceLabel(l, today) === "興櫃價" && <>興櫃價只是參考，掛牌後會變。</>}
                    {l.winRate !== null && <strong className="ml-1">實際中籤率 {l.winRate}%。</strong>}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default function LotteryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">🎟️ 股票抽籤</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          新股上市或增資前會開放大家抽籤，承銷價常比市價便宜。這裡每天自動整理證交所的公告，幫你算抽中一張大約賺多少、值不值得抽。
        </p>
      </header>
      <Suspense fallback={<div className="h-60 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />}>
        <Board />
      </Suspense>
      <section className="space-y-1 rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
        <p className="font-medium">怎麼抽、要付多少？</p>
        <ul className="list-inside list-disc space-y-0.5 text-zinc-600 dark:text-zinc-400">
          <li>任何一家券商都能抽，中籤率都一樣。國泰證券在 App 的「申購」裡就有。</li>
          <li>每抽一次付 {FEE} 元處理費，沒抽中也要付；抽中再收 {WIN_FEE} 元郵寄費。有些銀行另收扣款手續費。</li>
          <li>申購結束那天，交割帳戶要放夠「承銷價 × 股數」的錢，沒抽中會退回來。</li>
          <li>同一檔股票一個人只能抽一次。</li>
        </ul>
        <p className="font-medium">要小心</p>
        <ul className="list-inside list-disc space-y-0.5 text-zinc-600 dark:text-zinc-400">
          <li>「抽中約賺」是用現在的市價算的，從抽籤到上市還有幾天，股價可能下跌。</li>
          <li>熱門股的中籤率常不到 1%，大多數時候只是付 {FEE} 元。</li>
          <li>初上市、初上櫃用的是「興櫃價」：掛牌前在興櫃交易的價格，成交量小、起伏大，正式掛牌後可能跟它差很多。</li>
        </ul>
        <p className="text-xs text-zinc-500">資料：台灣證交所公開申購公告、FinMind 收盤價，每幾小時更新。不是投資建議。</p>
      </section>
    </div>
  );
}
