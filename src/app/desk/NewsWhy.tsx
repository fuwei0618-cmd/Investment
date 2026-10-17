import { splitCheck } from "@/lib/headlines";
import { getHeadlines, getReasons } from "@/lib/headlinesData";

// 新聞說的原因：AI 查過的整理＋數字對照＋來源；沒有金鑰時只列雅虎股市的新聞標題

const link =
  "underline decoration-stone-400 underline-offset-2 hover:decoration-current";

export default async function NewsWhy({
  market,
  date,
  facts,
}: {
  market: "us" | "tw";
  date: string;
  facts: string;
}) {
  const [r, heads] = await Promise.all([
    getReasons(market, date, facts),
    getHeadlines(market === "us" ? "intl-markets" : "tw-market"),
  ]);
  if (r)
    return (
      <div className="space-y-1">
        <h3 className="font-bold">新聞說的原因</h3>
        <ul className="space-y-1.5 text-sm">
          {r.lines.map((x) => {
            const c = splitCheck(x);
            return (
              <li
                key={x}
                className={`rounded-xl border-l-4 bg-[#f2f2ee] px-3 py-1.5 dark:bg-[#2a2e34] ${c.tone === "ok" ? "border-emerald-600" : c.tone === "bad" ? "border-amber-500" : "border-stone-300 dark:border-stone-600"}`}
              >
                <p>{c.why}</p>
                {c.check && (
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    數字對照：{c.check}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {r.sources.length > 0 && (
          <p className="text-xs text-stone-500">
            來源：
            {r.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && "、"}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className={link}
                >
                  {s.title}
                </a>
              </span>
            ))}
          </p>
        )}
        <p className="text-xs text-stone-500">
          AI
          上網查當天新聞整理的，英文新聞已翻成中文，再拿上面的數字對照。綠線是數字對得上，黃線是對不上，要小心。點來源可以看原文。
        </p>
      </div>
    );
  return (
    <div className="space-y-1">
      <h3 className="font-bold">新聞標題</h3>
      {heads.length ? (
        <ul className="list-disc space-y-0.5 pl-5 text-sm">
          {heads.map((h) => (
            <li key={h.url}>
              <a href={h.url} target="_blank" rel="noreferrer" className={link}>
                {h.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-stone-500">新聞暫時抓不到。</p>
      )}
      <p className="text-xs text-stone-500">
        雅虎股市最近的新聞。要讓網站自動整理成「為什麼」，要在 Vercel 設好 AI
        金鑰。
      </p>
    </div>
  );
}
