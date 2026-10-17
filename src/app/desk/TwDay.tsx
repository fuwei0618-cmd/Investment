import { connection } from "next/server";
import { getTaiex } from "@/lib/deskData";
import { move } from "@/lib/overnight";
import { getUsBars } from "@/lib/usData";
import Jump from "./Jump";
import NewsWhy from "./NewsWhy";
import { box } from "./parts";

// 昨天台股發生什麼：加權指數收盤、漲跌、月線，加上新聞說的原因

export default async function TwDayBox() {
  await connection();
  const [t, us] = await Promise.all([getTaiex(), getUsBars(["^SOX"])]);
  const wrap = `${box} min-w-0 scroll-mt-20 border-t-4 border-emerald-600`;
  if (!t)
    return (
      <section id="twday" className={wrap}>
        <h2 className="text-xl font-black">台股發生什麼</h2>
        <p className="text-sm text-stone-500">
          台股數字暫時抓不到，等一下再來。
        </p>
      </section>
    );
  const d = t.change;
  const chg =
    d == null
      ? "漲跌抓不到"
      : `${d < 0 ? "跌" : "漲"} ${Math.abs(d * 100).toFixed(1)}%`;
  const sox = move("費城半導體", us["^SOX"]);
  const facts = [
    `加權指數 ${Math.round(t.close)}（${chg}）`,
    `月線 ${Math.round(t.ma)}，大盤在月線${t.above ? "上面" : "下面"}`,
    sox?.d != null
      ? `前一晚美國費城半導體 ${sox.d > 0 ? "+" : ""}${(sox.d * 100).toFixed(1)}%`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  const topics = [
    {
      words: ["台積電", "半導體", "晶片"],
      name: "前一晚費半",
      d: sox?.d ?? null,
    },
    { words: ["台股", "加權", "大盤", "指數"], name: "加權指數", d },
  ];
  return (
    <section id="twday" className={wrap}>
      <h2 className="text-xl font-black">
        台股發生什麼
        <span className="ml-2 text-sm font-normal text-stone-500">
          收盤日 {t.date}
        </span>
      </h2>
      <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <li className="rounded-xl bg-[#e9e9e4] p-2 tabular-nums dark:bg-[#2a2e34]">
          <span className="block text-xs text-stone-500">加權指數</span>
          <b>{Math.round(t.close)}</b>{" "}
          <span
            className={
              d == null
                ? "text-stone-500"
                : d < 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
            }
          >
            {chg}
          </span>
        </li>
        <li className="rounded-xl bg-[#e9e9e4] p-2 tabular-nums dark:bg-[#2a2e34]">
          <span className="block text-xs text-stone-500">月線</span>
          <b>{Math.round(t.ma)}</b>{" "}
          <span className="text-stone-500">
            {t.above ? "大盤在上面" : "大盤在下面"}
          </span>
        </li>
      </ul>
      <NewsWhy market="tw" date={t.date} facts={facts} topics={topics} />
      <p className="text-sm">
        要不要放空、手上的怎麼辦，看上面{" "}
        <Jump to="overnight">我可以做什麼</Jump>。
      </p>
    </section>
  );
}
