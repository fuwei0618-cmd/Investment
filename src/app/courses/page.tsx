import Link from "next/link";
import { COURSES } from "@/lib/courses";
import { placeOf } from "@/lib/modules";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">課程對照</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          複習某堂課時，找到那個單元，點右邊的標籤就會打開網站上對應的地方。灰字是這個單元的重點。標「之後加入」的是還沒做的功能。
        </p>
      </header>
      {COURSES.map((c) => (
        <details
          key={c.key}
          open={c.key === "ai-agent"}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <summary className="cursor-pointer">
            <span className="text-lg font-medium">{c.name}</span>
            <span className="ml-2 text-sm text-zinc-500">{c.teacher}</span>
            {c.status === "upcoming" && <span className="ml-2 text-xs text-amber-600">尚未上架</span>}
            <p className="mt-1 text-sm text-zinc-500">{c.role}</p>
          </summary>
          <div className="mt-3 space-y-4">
            {c.chapters.map((ch) => (
              <div key={ch.title}>
                <h3 className="mb-1 text-sm font-medium">{ch.title}</h3>
                <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
                  {ch.units.map((x) => {
                    const m = x.module ? placeOf(x.module) : null;
                    return (
                      <li key={x.code} className="flex items-start gap-2 py-1.5">
                        <span className="w-12 shrink-0 tabular-nums text-zinc-500">{x.code}</span>
                        <span className="flex-1">
                          {x.title}
                          {x.point && (
                            <span className="mt-0.5 block text-xs text-zinc-500">
                              {x.point}
                              {x.feature && <span className="text-blue-600 dark:text-blue-400">（{x.feature}）</span>}
                            </span>
                          )}
                        </span>
                        {m ? (
                          <Link
                            href={m.href}
                            className={`shrink-0 rounded px-2 py-0.5 text-xs ${
                              m.area !== "later"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                            }`}
                          >
                            {m.label}
                          </Link>
                        ) : (
                          <span className="shrink-0 text-xs text-zinc-400">方法與工具</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
