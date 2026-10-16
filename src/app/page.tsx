import Link from "next/link";
import { Suspense } from "react";
import LightDot from "@/components/Light";
import { getTodayAnswers } from "@/lib/todayData";
import { mood } from "@/lib/chips";
import { getChips } from "@/lib/chipsData";
import { ACTS } from "@/lib/acts";

async function Today() {
  const [t, chips] = await Promise.all([getTodayAnswers(), getChips()]);
  const m = chips ? mood(chips.days, chips.margin?.change ?? null) : null;
  const rows = [
    { q: "世界景氣好嗎？", a: t.economy, href: "/market#level-1" },
    { q: "錢變多還是變少？", a: t.money, href: "/market#level-2" },
    { q: "現在是哪一季？", a: t.season, href: "/market#level-3" },
    { q: "大戶在進場嗎？", a: m && { light: m.light, answer: `${m.name}：${m.line}` }, href: "/chips#mood" },
  ];
  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {rows.map((r) => (
        <li key={r.q}>
          <Link href={r.href} className="flex items-start gap-3 py-3">
            <span className="mt-1.5">
              <LightDot light={r.a?.light ?? null} />
            </span>
            <span>
              <span className="block text-sm text-zinc-500">{r.q}</span>
              {r.a?.answer ?? "今天的數字暫時抓不到"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// 首頁就是戲單：六幕照順序，一幕一步
function Programme() {
  return (
    <section className="space-y-3 rounded-2xl bg-[#f4eee2] p-3 dark:bg-[#18150f]">
      <div className="px-1">
        <h2 className="text-xl font-black">麵包鎮小劇場：新鎮民小麥的一天</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">投資分六步，一步一幕，從早上演到晚上。第一次照順序走；季節換了，再從第二幕走一次。</p>
      </div>
      <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {ACTS.map((a) => (
          <li key={a.n} className="flex flex-col gap-2 rounded-2xl bg-[#fffdf8] p-3 shadow-[0_1px_2px_rgba(60,40,10,.06),0_6px_16px_rgba(60,40,10,.08)] dark:bg-[#221d16]">
            <div>
              <p className="text-xs font-bold text-[#8a6a3f]">
                第{a.n}幕・投資第 {a.n} 步
              </p>
              <h3 className="text-lg font-black leading-tight">{a.title}</h3>
              <p className="text-sm font-bold">{a.q}</p>
            </div>
            <ul className="space-y-1">
              {a.pages.map((p) => {
                const inner = (
                  <>
                    <b className="block text-sm">{p.name} →</b>
                    <span className="text-xs text-stone-600 dark:text-stone-400">{p.note}</span>
                  </>
                );
                const cls = "block rounded-xl bg-[#f3ead8] px-2.5 py-1.5 hover:bg-[#ecdfc4] dark:bg-[#2f281f]";
                return (
                  <li key={p.href}>
                    {p.href.endsWith(".html") ? (
                      <a href={p.href} className={cls}>
                        {inner}
                      </a>
                    ) : (
                      <Link href={p.href} className={cls}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-auto border-t-2 border-dashed border-[#d9c7a3] pt-1.5 text-xs">
              <b>帶走：</b>
              {a.take}
            </p>
          </li>
        ))}
      </ol>
      <p className="px-1 text-xs text-stone-500">
        後台隨時可以進去：
        <Link href="/courses" className="text-blue-600">
          課程對照
        </Link>
        、
        <Link href="/market" className="text-blue-600">
          問 AI（看市場最上面）
        </Link>
        、
        <a href="/game/bakery.html" className="text-blue-600">
          麵包鎮大富翁
        </a>
      </p>
    </section>
  );
}

export default function Home() {
  return (
    <div className="space-y-6">
      <Programme />
      <section className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 dark:bg-amber-950">
        <h1 className="text-lg font-semibold">今天的市場，一句話</h1>
        <Suspense fallback={<p className="py-3 text-sm text-zinc-500">讀取今天的數字…</p>}>
          <Today />
        </Suspense>
        <Link href="/market" className="text-sm text-blue-600">
          繼續看產業和公司 →
        </Link>
      </section>
    </div>
  );
}
