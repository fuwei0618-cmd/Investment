import { brief, links } from "@/lib/pick";
import type { Pick } from "@/lib/pickData";
import { fmt } from "@/lib/storage";

// 資訊模板：選了一檔之後，一次說清楚 今天要不要買／想盯的話等什麼／為什麼爆量
export default function Brief({ x }: { x: Pick }) {
  const b = brief(x);
  const l = links(x.code);
  return (
    <article className="space-y-3 rounded-2xl border-2 border-amber-300 bg-white p-4 dark:border-amber-800 dark:bg-stone-900">
      <h3 className="text-lg font-black">
        {x.name} {x.code} 的功課
      </h3>

      <section className="space-y-1.5">
        <h4 className="font-bold">
          一、今天要不要買？
          <span className={b.buy ? "text-red-600" : "text-stone-500"}>
            {b.buy ? "三個條件都過，照操作卡可以買。" : "照操作卡，今天不買。"}
          </span>
        </h4>
        <ul className="space-y-1.5 text-sm">
          {b.rows.map((r) => (
            <li key={r.text}>
              <span className={r.ok ? "text-red-600" : "text-stone-500"}>
                {r.ok ? "✓" : "✗"} {r.text}
              </span>
              <span className="block pl-4 text-xs text-stone-500">
                為什麼看這個：{r.why}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {!b.buy && (
        <section className="space-y-1 text-sm">
          <h4 className="font-bold">二、想盯它的話，等這些出現</h4>
          <ul className="list-disc space-y-0.5 pl-5">
            <li>
              <b>進場：</b>
              {b.wait.join("，而且")}。
            </li>
            <li>
              <b>停損：</b>
              {b.stop}
            </li>
            <li>
              <b>停利：</b>
              {b.target}。
            </li>
          </ul>
        </section>
      )}

      <section className="space-y-1.5 text-sm">
        <h4 className="font-bold">
          {b.buy ? "二" : "三"}、它為什麼有人搶？（網站幫你做的功課）
        </h4>
        <p>
          大戶動向：今天外資買超 {fmt(x.foreign, 1)} 億、投信 {fmt(x.trust, 1)}{" "}
          億；{x.conds[0]?.text.split("（")[0]}；成交量是平常{" "}
          {fmt(x.volRatio, 1)} 倍。
        </p>
        {x.news.length > 0 ? (
          <>
            <p className="text-xs text-stone-500">
              最近幾天的新聞（點標題看原文，判斷是題材、財報還是一次性消息）：
            </p>
            <ul className="space-y-1">
              {x.news.map((n) => (
                <li key={n.link}>
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline dark:text-blue-400"
                  >
                    {n.title}
                  </a>
                  <span className="text-xs text-stone-500">
                    {" "}
                    {n.date.slice(5)}・{n.source}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-xs text-stone-500">
            這幾天沒抓到這檔的新聞，可以按下面「看新聞」自己確認。
          </p>
        )}
        <p className="text-xs text-stone-500">
          讀新聞時問自己三件事：是公司真的變好（營收、訂單），還是只是題材輪動？大戶是連續買，還是一天就走？漲了多少，現在追會不會太高？
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <a
          href={l.chart}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#f3ead8] px-4 py-2 text-sm font-bold dark:bg-[#2f281f]"
        >
          看 K 線 ↗
        </a>
        <a
          href={l.news}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#f3ead8] px-4 py-2 text-sm font-bold dark:bg-[#2f281f]"
        >
          看新聞 ↗
        </a>
      </div>
    </article>
  );
}
