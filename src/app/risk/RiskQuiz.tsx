"use client";

import Link from "next/link";
import { DIMENSIONS, QUESTIONS, RISK_TYPES, RiskResult, Answers, scoreAnswers } from "@/lib/risk";
import { usePersistentState } from "@/lib/storage";

export default function RiskQuiz() {
  const [answers, setAnswers] = usePersistentState<Answers>("risk.answers.v1", {});
  const [result, setResult] = usePersistentState<RiskResult | null>("risk.result.v1", null);
  const answered = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;

  function submit() {
    setResult({ ...scoreAnswers(answers), date: new Date().toISOString().slice(0, 10) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      {result && <ResultCard result={result} />}

      {DIMENSIONS.map((d) => (
        <section
          key={d.key}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-3 font-medium">
            {d.label}
            <span className="ml-2 text-sm font-normal text-zinc-500">權重 {d.weight * 100}%</span>
          </h2>
          <ol className="space-y-4">
            {QUESTIONS.filter((q) => q.dimension === d.key).map((q) => (
              <li key={q.id}>
                <p className="mb-2 text-sm">{q.text}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAnswers({ ...answers, [q.id]: i })}
                      className={`rounded-md border px-3 py-2 text-left text-sm ${
                        answers[q.id] === i
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                          : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={answered < QUESTIONS.length}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
        >
          計算結果
        </button>
        <span className="text-sm text-zinc-500">
          已回答 {answered} / {QUESTIONS.length} 題
        </span>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: RiskResult }) {
  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-semibold tabular-nums">{result.total}</span>
        <span className="text-xl font-medium">{result.type.name}</span>
        <span className="ml-auto text-xs text-zinc-500">評估日 {result.date}</span>
      </div>
      <p className="text-sm">{result.type.desc}</p>

      <div>
        <div className="flex h-2 overflow-hidden rounded-full">
          {RISK_TYPES.map((t, i) => {
            const next = RISK_TYPES[i + 1]?.min ?? 100;
            return (
              <div
                key={t.key}
                style={{ width: `${next - t.min}%` }}
                className={t.key === result.type.key ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"}
              />
            );
          })}
        </div>
        <div className="mt-1 flex text-xs text-zinc-500">
          {RISK_TYPES.map((t, i) => (
            <span key={t.key} style={{ width: `${(RISK_TYPES[i + 1]?.min ?? 100) - t.min}%` }}>
              {t.name}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {DIMENSIONS.map((d) => (
          <div key={d.key} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2 text-sm">
            <span className="text-zinc-500">{d.label}</span>
            <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${result.dims[d.key]}%` }} />
            </div>
            <span className="text-right tabular-nums">{result.dims[d.key]}</span>
          </div>
        ))}
      </div>

      <p className="text-sm">
        建議高風險資產上限 <strong>{Math.round(result.type.riskRatio * 100)}%</strong>
        ，持股頁會再和你的年齡建議比較，取較保守的一邊。
        <Link href="/portfolio" className="ml-1 text-blue-600">
          前往持股與 ETF 健檢 →
        </Link>
      </p>
      <p className="text-xs text-zinc-500">
        課程只公布四個維度與權重；題目與五型分界（30／50／65／80 分）是依課程描述設計，可再調整。
      </p>
    </section>
  );
}
