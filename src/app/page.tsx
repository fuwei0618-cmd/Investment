import Link from "next/link";
import { Suspense } from "react";
import LightDot from "@/components/Light";
import { getTodayAnswers } from "@/lib/todayData";

async function Today() {
  const t = await getTodayAnswers();
  const rows = [
    { q: "世界景氣好嗎？", a: t.economy, href: "/market#level-1" },
    { q: "錢變多還是變少？", a: t.money, href: "/market#level-2" },
    { q: "現在是哪一季？", a: t.season, href: "/market#level-3" },
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

const AREAS = [
  { href: "/money", title: "我的錢", text: "先弄清楚自己：要存多少、能承受多少風險、手上有什麼。", steps: "1 設目標 → 2 測風險 → 3 看持股" },
  { href: "/market", title: "看市場", text: "8 關由大到小：世界 → 產業 → 公司，每關先給答案。", steps: "看世界 → 看產業 → 看公司" },
  { href: "/courses", title: "課程", text: "複習任何一門課時，查這個單元在網站的哪裡。", steps: "M平方・CodeGym・王伯達" },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 dark:bg-amber-950">
        <h1 className="text-lg font-semibold">今天的市場，一句話</h1>
        <Suspense fallback={<p className="py-3 text-sm text-zinc-500">讀取今天的數字…</p>}>
          <Today />
        </Suspense>
        <Link href="/market" className="text-sm text-blue-600">
          繼續看產業和公司 →
        </Link>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {AREAS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-medium">{a.title}</h2>
            <p className="mt-1 text-sm">{a.text}</p>
            <p className="mt-2 text-xs text-zinc-500">{a.steps}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
