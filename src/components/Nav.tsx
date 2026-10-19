"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 全站是麵包鎮六幕（站牌在每頁上面），選單只留每天看的實戰頁（也是起始頁）、戲單和課程對照。
const AREAS = [
  { href: "/desk", label: "實戰", match: ["/desk"] },
  { href: "/play", label: "戲單", match: ["/play"] },
  { href: "/courses", label: "課程", match: ["/courses"] },
];
// 信念頁（Origina 床邊）的投資分頁：跟上面三個工具不同類，用金色底＋框區分
const BELIEF = { href: "https://fuwei0618-cmd.github.io/Entry/bedside/#money", label: "宇宙印鈔機" };

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/desk" className="shrink-0 font-semibold">
          投資羅盤
        </Link>
        <div className="ml-auto flex gap-1 text-sm">
          {AREAS.map((a) => {
            const active = a.match.includes(pathname);
            return (
              <Link
                key={a.href}
                href={a.href}
                className={`rounded-md px-3 py-1.5 ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {a.label}
              </Link>
            );
          })}
          <a
            href={BELIEF.href}
            className="ml-1 rounded-md border border-[#c9a55a] bg-[#f6ecd6] px-3 py-1.5 font-semibold text-[#7a5a1e] hover:bg-[#efe0bd] dark:border-[#c9a55a] dark:bg-[#3d3322] dark:text-[#e6c98e]"
          >
            {BELIEF.label}
          </a>
        </div>
      </div>
    </nav>
  );
}
