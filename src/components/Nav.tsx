"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/lib/modules";

export default function Nav() {
  const pathname = usePathname();
  const item = (href: string, label: string, dim = false) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`shrink-0 rounded-md px-2.5 py-1.5 ${
          active
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        } ${dim ? "opacity-60" : ""}`}
      >
        {label}
      </Link>
    );
  };
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 font-semibold">
          投資羅盤
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto text-sm">
          {MODULES.map((m) =>
            item(`/${m.slug}`, `${m.group === "agent" ? m.order + ". " : ""}${m.title}`, m.status === "planned"),
          )}
          <span className="mx-1 h-4 w-px shrink-0 bg-zinc-300 dark:bg-zinc-700" />
          {item("/courses", "課程對照")}
        </div>
      </div>
    </nav>
  );
}
