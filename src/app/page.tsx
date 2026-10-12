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
  const compass = MODULES.find((m) => m.group === "compass")!;
  const foundation = MODULES.filter((m) => m.group === "foundation");
  const agent = MODULES.filter((m) => m.group === "agent");
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">投資羅盤</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          新手從「思維羅盤」開始，照 8 步由大到小看懂世界、產業和公司；〈AI Agent 投資系統實戰課〉九章是每一步用到的工具。每頁底部列出對應的課程單元，
          <Link href="/courses" className="text-blue-600">
            課程對照
          </Link>
          頁可從課程反查到頁面。
        </p>
      </header>
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500">從這裡開始</h2>
        <Link
          href="/compass"
          className="block rounded-lg border-2 border-amber-400 bg-amber-50 p-4 hover:border-amber-500 dark:bg-amber-950"
        >
          <h3 className="text-lg font-medium">{compass.title}・8 步</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{compass.question}</p>
          <p className="mt-2 text-sm">{compass.summary}</p>
          <p className="mt-2 text-xs text-zinc-500">
            ① 全球經濟 ② 全球資金 ③ 景氣落點 ④ 適合產業 ⑤ 產業三要領 ⑥ 贏勢股 ⑦ 評價 ⑧ 買進賣出
          </p>
        </Link>
      </section>
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
