import Link from "next/link";
import { Suspense } from "react";
import LightDot from "@/components/Light";
import { getTodayAnswers } from "@/lib/todayData";
import { mood } from "@/lib/chips";
import { getChips } from "@/lib/chipsData";
import Stage from "@/components/Stage";

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

// 後台：不在六幕裡、隨時可以進去的地方
function Backstage() {
  return (
    <p className="rounded-2xl bg-[#f4eee2] px-4 py-3 text-sm dark:bg-[#18150f]">
      <b>後台隨時可以進去：</b>
      <Link href="/courses" className="text-blue-600">
        圖書館（課程對照）
      </Link>
      、
      <Link href="/market" className="text-blue-600">
        問路處（問 AI，在看市場最上面）
      </Link>
      、
      <a href="/game/bakery.html" className="text-blue-600">
        遊樂場（麵包鎮大富翁）
      </a>
    </p>
  );
}

export default function Home() {
  return (
    <div className="space-y-6">
      <Stage />
      <Backstage />
      <section className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 dark:bg-amber-950">
        <h2 className="text-lg font-semibold">今天的市場，一句話</h2>
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
