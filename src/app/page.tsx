import Link from "next/link";
import { AppModule, MODULES, moduleLabel } from "@/lib/modules";

function Card({ m }: { m: AppModule }) {
  return (
    <Link
      href={`/${m.slug}`}
      className="block h-full rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
    >
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>{moduleLabel(m)}</span>
        <span className={m.status === "ready" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}>
          {m.status === "ready" ? "可使用" : "規劃中"}
        </span>
      </div>
      <h2 className="mt-1 text-lg font-medium">{m.title}</h2>
      <p className="text-sm text-zinc-500">{m.question}</p>
      <p className="mt-2 text-sm">{m.summary}</p>
    </Link>
  );
}

export default function Home() {
  const foundation = MODULES.filter((m) => m.group === "foundation");
  const agent = MODULES.filter((m) => m.group === "agent");
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">投資羅盤</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          以〈AI Agent 投資系統實戰課〉九章為主架構，其他課程的方法整合進對應章節。每頁底部列出對應的課程單元，
          <Link href="/courses" className="text-blue-600">
            課程對照
          </Link>
          頁可從課程反查到頁面。
        </p>
      </header>
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500">基礎設定・先做一次，每年更新</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {foundation.map((m) => (
            <Card key={m.slug} m={m} />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500">AI Agent 投資系統・九章</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agent.map((m) => (
            <li key={m.slug}>
              <Card m={m} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
