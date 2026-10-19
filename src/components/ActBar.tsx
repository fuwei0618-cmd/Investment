"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ACTS, SCENES, actOf, isHere, type ActPage } from "@/lib/acts";
import { Face } from "./Stage";

// 看市場一頁跨三幕，要跟著 #level-N 換站牌
function useLevel() {
  const [level, setLevel] = useState(1);
  useEffect(() => {
    const read = () => setLevel(Number(location.hash.match(/level-(\d)/)?.[1] ?? 1));
    read();
    window.addEventListener("hashchange", read);
    window.addEventListener("levelchange", read);
    return () => {
      window.removeEventListener("hashchange", read);
      window.removeEventListener("levelchange", read);
    };
  }, []);
  return level;
}

// 有 # 或是靜態遊戲頁就用一般連結，同一頁換關卡才會觸發 hashchange
function Go({ href, className, children, current }: { href: string; className: string; children: React.ReactNode; current?: boolean }) {
  const aria = current ? { "aria-current": "page" as const } : {};
  if (href.includes("#") || href.endsWith(".html"))
    return (
      <a href={href} className={className} {...aria}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={className} {...aria}>
      {children}
    </Link>
  );
}

const paper = "rounded-2xl bg-[#f4eee2] dark:bg-[#18150f]";

// 每頁最上面的站牌：現在第幾幕、這一幕在投資上是哪一步、這一幕有哪幾頁
export function ActSign() {
  const pathname = usePathname();
  const level = useLevel();
  const act = actOf(pathname, level);
  if (!act) return null;
  // 這一幕主持角色的第一句台詞
  const sc = SCENES[act.n];
  const [who, say] = sc.lines.find(([w]) => sc.cast[w].face !== "麥") ?? sc.lines[0];
  const host = sc.cast[who];
  return (
    <nav aria-label="麵包鎮六幕" className={`${paper} mb-5 space-y-2.5 p-3`}>
      <ol className="grid grid-cols-6 gap-1">
        {ACTS.map((a) => {
          const on = a.n === act.n;
          return (
            <li key={a.n}>
              <Go
                href={a.pages[0].href}
                current={on}
                className={`block h-full rounded-xl px-1.5 py-1.5 text-center text-xs leading-tight sm:text-left ${on ? "bg-[#b4651e] text-white" : "bg-[#fffdf8] text-stone-600 hover:text-stone-900 dark:bg-[#2f281f] dark:text-stone-300"}`}
              >
                <b className="block">第{a.n}幕</b>
                <span className="hidden sm:block">{a.title}</span>
              </Go>
            </li>
          );
        })}
      </ol>
      <div className="flex items-start gap-2.5 px-1">
        <Face c={host} />
        <div className="min-w-0">
          <p className="text-lg font-black leading-tight">
            第{act.n}幕・{act.title}
            <span className="ml-2 text-xs font-bold text-[#8a6a3f]">投資第 {act.n} 步：{act.q}</span>
          </p>
          <p className="mt-0.5 text-sm text-stone-700 dark:text-stone-300">
            <b>{host.name}：</b>「{say}」
          </p>
        </div>
      </div>
      {act.pages.length > 1 && (
        <ul className="flex flex-wrap gap-1.5">
          {act.pages.map((p: ActPage) => {
            const on = isHere(p, pathname, level);
            return (
              <li key={p.href}>
                <Go
                  href={p.href}
                  current={on}
                  className={`block rounded-full border-2 px-3 py-1 text-sm font-bold ${on ? "border-amber-400 bg-[#fffdf8] dark:bg-[#221d16]" : "border-transparent bg-[#f3ead8] dark:bg-[#2f281f]"}`}
                >
                  {p.name}
                </Go>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}

// 每頁最下面：帶走什麼、上一幕／下一幕
export function ActNext() {
  const pathname = usePathname();
  const level = useLevel();
  const act = actOf(pathname, level);
  if (!act) return null;
  const prev = ACTS[act.n - 2];
  const next = ACTS[act.n];
  return (
    <nav aria-label="上一幕、下一幕" className={`${paper} mb-8 space-y-2 p-3`}>
      <p className="px-1 text-sm">
        <b>走出這一幕，手上多了：</b>
        {act.take}
      </p>
      <div className="flex flex-wrap justify-between gap-2">
        {prev ? (
          <Go href={prev.pages[0].href} className="rounded-full bg-[#fffdf8] px-4 py-2 text-sm font-bold dark:bg-[#2f281f]">
            ← 第{prev.n}幕・{prev.title}
          </Go>
        ) : (
          <Link href="/play" className="rounded-full bg-[#fffdf8] px-4 py-2 text-sm font-bold dark:bg-[#2f281f]">
            ← 回戲單
          </Link>
        )}
        {next ? (
          <Go href={next.pages[0].href} className="rounded-full bg-[#b4651e] px-4 py-2 text-sm font-bold text-white">
            下一幕：{next.title} →
          </Go>
        ) : (
          <Link href="/play" className="rounded-full bg-[#b4651e] px-4 py-2 text-sm font-bold text-white">
            謝幕，回戲單 →
          </Link>
        )}
      </div>
    </nav>
  );
}
