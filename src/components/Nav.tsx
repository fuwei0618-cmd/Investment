"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 整個網站只有三區。子頁面歸屬到所在的區，讓目前位置一直亮著。
const AREAS = [
  { href: "/money", label: "我的錢", match: ["/money", "/goals", "/risk", "/portfolio"] },
  { href: "/market", label: "看市場", match: ["/market", "/macro", "/industry"] },
  { href: "/courses", label: "課程", match: ["/courses"] },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 font-semibold">
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
        </div>
      </div>
    </nav>
  );
}
