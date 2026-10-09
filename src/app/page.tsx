import Link from "next/link";
import { MODULES } from "@/lib/modules";

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">投資羅盤</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          從財務目標到持股管理，照課程的決策流程一步步走。
        </p>
      </header>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <li key={m.slug}>
            <Link
              href={`/${m.slug}`}
              className="block h-full rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>步驟 {m.step}</span>
                <span
                  className={
                    m.status === "ready"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400"
                  }
                >
                  {m.status === "ready" ? "可使用" : "規劃中"}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-medium">{m.title}</h2>
              <p className="text-sm text-zinc-500">{m.question}</p>
              <p className="mt-2 text-sm">{m.summary}</p>
              <p className="mt-2 text-xs text-zinc-500">{m.courses.join("・")}</p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
