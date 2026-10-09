import Link from "next/link";
import { unitsForModule } from "@/lib/courses";

// 每頁底部：這一頁對應到哪些課程單元，方便回頭複習時對照。
export default function CourseRefs({ slug }: { slug: string }) {
  const groups = unitsForModule(slug);
  if (groups.length === 0) return null;
  return (
    <details className="rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <summary className="cursor-pointer font-medium">
        對應課程單元（{groups.reduce((s, g) => s + g.units.length, 0)}）
      </summary>
      <div className="mt-3 space-y-3">
        {groups.map(({ course, units }) => (
          <div key={course.key}>
            <p className="font-medium">
              {course.name}
              {course.status === "upcoming" && <span className="ml-2 text-xs text-amber-600">尚未上架</span>}
            </p>
            <ul className="mt-1 space-y-0.5 text-zinc-600 dark:text-zinc-400">
              {units.map((x) => (
                <li key={x.code} className="flex gap-2">
                  <span className="w-12 shrink-0 tabular-nums text-zinc-500">{x.code}</span>
                  <span>
                    {x.title}
                    {x.point && <span className="block text-xs text-zinc-500">{x.point}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link href="/courses" className="text-blue-600">
          看全部課程對照 →
        </Link>
      </div>
    </details>
  );
}
