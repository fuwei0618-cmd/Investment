import Link from "next/link";
import { connection } from "next/server";
import { getTaiex } from "@/lib/deskData";
import {
  dipCheck,
  downStreak,
  factsText,
  fromHigh,
  move,
  overnight,
  tenYear,
} from "@/lib/overnight";
import { aboveMa20, changeOver, US_SECTORS } from "@/lib/us";
import { getUsBars } from "@/lib/usData";
import HoldingsNow from "./HoldingsNow";
import Jump from "./Jump";
import NewsWhy from "./NewsWhy";
import { box, more } from "./parts";

// 昨晚美股發生什麼、大跌提醒、低接卡（台股、美股實戰頁共用）

const SYMS = [
  "^GSPC",
  "^IXIC",
  "^SOX",
  "^VIX",
  "^TNX",
  "CL=F",
  "GC=F",
  "^TWII",
  ...US_SECTORS.map((x) => x[0]),
];

async function night() {
  const bars = await getUsBars(SYMS);
  const spx = move("標普 500", bars["^GSPC"]);
  const ndx = move("那斯達克", bars["^IXIC"]);
  const sox = move("費城半導體", bars["^SOX"]);
  const oil = move("原油", bars["CL=F"]);
  const gold = move("黃金", bars["GC=F"]);
  const soxStreak = downStreak(bars["^SOX"]);
  const sectors = US_SECTORS.map(([s, name]) => ({
    name,
    d: changeOver(bars[s], 1),
  }));
  const tnx = tenYear(bars["^TNX"]);
  const r = overnight({ spx, ndx, sox, soxStreak, sectors, tnx, oil, gold });
  const facts = factsText({
    moves: [spx, ndx, sox, move("恐慌指數", bars["^VIX"]), oil, gold],
    soxStreak,
    sectors,
    tnx,
  });
  const d = (x: { d: number | null } | null) => x?.d ?? null;
  const topics = [
    {
      words: ["費半", "半導體", "晶片", "輝達", "台積"],
      name: "費城半導體",
      d: d(sox),
    },
    { words: ["那斯達克", "那指", "科技股"], name: "那斯達克", d: d(ndx) },
    { words: ["油"], name: "原油", d: d(oil) },
    { words: ["黃金", "金價"], name: "黃金", d: d(gold) },
    {
      words: ["美債", "殖利率", "公債"],
      name: "十年美債利率",
      d: changeOver(bars["^TNX"], 1),
    },
    { words: ["恐慌"], name: "恐慌指數", d: changeOver(bars["^VIX"], 1) },
    { words: ["美股", "標普", "道瓊", "華爾街"], name: "標普 500", d: d(spx) },
  ];
  return { bars, r, facts, topics };
}

const pct = (d: number | null | undefined) =>
  d == null
    ? ""
    : Math.abs(d) < 0.0005
      ? "0.0%"
      : `${d > 0 ? "+" : ""}${(d * 100).toFixed(1)}%`;
const tone = (d: number | null | undefined) =>
  d == null
    ? "text-stone-500"
    : d < 0
      ? "text-emerald-700 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";

const RULES = [
  "停損只能往上移，不能往下移。",
  "沒碰到停損就抱著。新聞不是賣的理由，停損才是。",
  "碰到停損就賣，不要等它漲回來。",
  "不要往下加碼攤平。想低接，用低接卡，另外算一筆。",
];

/** 大跌那天，最上面三張卡下面跳一行 */
export async function BigDropLine() {
  await connection();
  const { r } = await night();
  if (!r?.big) return null;
  return (
    <p className="rounded-xl border-2 border-red-500 bg-white px-3 py-2 text-sm dark:bg-[#1f2328]">
      <b>昨晚{r.head}</b>：{r.why[0]}
      <span className="ml-1">
        <Jump to="overnight">看對你的影響 →</Jump>
      </span>
    </p>
  );
}

/** 昨晚發生什麼：數字、為什麼、我可以做什麼、我手上的 */
export async function OvernightBox({ market }: { market: "tw" | "us" }) {
  await connection();
  const [{ bars, r, facts, topics }, taiex] = await Promise.all([
    night(),
    market === "tw" ? getTaiex() : Promise.resolve(null),
  ]);
  const wrap = `${box} min-w-0 scroll-mt-20 border-t-4 border-emerald-600`;
  if (!r)
    return (
      <section id="overnight" className={wrap}>
        <h2 className="text-xl font-black">昨晚美股發生什麼</h2>
        <p className="text-sm text-stone-500">
          美股數字暫時抓不到，等一下再來。
        </p>
      </section>
    );
  const date = bars["^GSPC"].at(-1)?.date ?? "";
  const spx = aboveMa20(bars["^GSPC"]);
  const vix = bars["^VIX"].at(-1)?.close ?? null;
  const dip = dipCheck(
    vix,
    fromHigh(bars[market === "tw" ? "^TWII" : "^GSPC"]),
  );
  const nums: [string, string, number | null][] = [
    ["^GSPC", "標普 500", 0],
    ["^IXIC", "那斯達克", 0],
    ["^SOX", "費城半導體", 0],
    ["^VIX", "恐慌指數", 1],
    ["CL=F", "原油", 1],
    ["GC=F", "黃金", 0],
  ];
  const tnx = tenYear(bars["^TNX"]);

  const act = (
    title: string,
    body: React.ReactNode,
    href?: string,
    label?: string,
    on = false,
  ) => (
    <li
      key={title}
      className={`space-y-0.5 rounded-xl border-l-4 bg-[#f2f2ee] px-3 py-2 text-sm dark:bg-[#2a2e34] ${on ? "border-amber-500" : "border-stone-300 dark:border-stone-600"}`}
    >
      <p>
        <b>{title}</b>　{body}
      </p>
      {href && (
        <Link href={href} className={`font-bold ${more}`}>
          {label}
        </Link>
      )}
    </li>
  );

  return (
    <section id="overnight" className={wrap}>
      <h2 className="text-xl font-black">
        昨晚美股發生什麼
        <span className="ml-2 text-sm font-normal text-stone-500">
          收盤日 {date}
        </span>
      </h2>
      <p className="flex items-baseline gap-2 rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm dark:border-stone-700">
        <span className="shrink-0 rounded-full bg-emerald-600 px-2 text-xs font-bold text-white">
          主要
        </span>
        第 1 步的背景，大跌的隔天要先看。每天開盤前看一次。
      </p>
      <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {nums.map(([s, name, d]) => {
          const b = bars[s];
          const c = changeOver(b, 1);
          return (
            <li
              key={s}
              className="rounded-xl bg-[#e9e9e4] p-2 tabular-nums dark:bg-[#2a2e34]"
            >
              <span className="block text-xs text-stone-500">{name}</span>
              <b>{b.at(-1)?.close.toFixed(d ?? 0) ?? "—"}</b>{" "}
              <span className={tone(c)}>{pct(c)}</span>
            </li>
          );
        })}
        <li className="rounded-xl bg-[#e9e9e4] p-2 tabular-nums dark:bg-[#2a2e34]">
          <span className="block text-xs text-stone-500">十年美債利率</span>
          <b>{tnx == null ? "—" : `${tnx.toFixed(2)}%`}</b>
        </li>
      </ul>

      <NewsWhy market="us" date={date} facts={facts} topics={topics} />

      <div className="space-y-1">
        <h3 className="font-bold">
          數字看到的
          <span className="ml-2 text-xs font-normal text-stone-500">
            跌漲最多的是哪一類是事實，後面的解釋是推測
          </span>
        </h3>
        <ul className="list-disc space-y-0.5 pl-5 text-sm">
          {r.why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-bold">我可以做什麼</h3>
        {market === "tw" && r.chipsWorst && (
          <p className="text-sm">
            半導體跌最兇。台股大盤一半以上是半導體，今天開盤容易跟著跌。
          </p>
        )}
        <ul className="space-y-1.5">
          {market === "tw"
            ? taiex && !taiex.above
              ? act(
                  "放空台股",
                  `台股大盤 ${Math.round(taiex.close)} 在月線 ${Math.round(taiex.ma)} 下面，條件到了。買反向的 00632R，大盤跌它就漲。跌 5% 停損、漲 8% 先賣一半、最多放兩週、錢最多一成。`,
                  "/go/tw-stock",
                  "帶我做放空 →",
                  true,
                )
              : act(
                  "不放空",
                  taiex
                    ? `台股大盤還在月線上，不放空。買股票照策略卡名單。`
                    : "台股大盤暫時抓不到，先不動。",
                )
            : spx && !spx.above
              ? act(
                  "放空美股",
                  `標普 ${Math.round(spx.close)} 在月線 ${Math.round(spx.ma)} 下面，條件到了。買一倍的反向標普 500（SH），標普跌它就漲。跌 5% 停損、漲 8% 先賣一半、最多放兩週、錢最多一成。`,
                  "/go/us-stock",
                  "帶我做美股放空 →",
                  true,
                )
              : act(
                  "不放空",
                  spx
                    ? "標普還在月線上，不放空。買股票照策略卡名單。"
                    : "標普暫時抓不到，先不動。",
                )}
          {act(
            "低接",
            dip.pass ? (
              <>
                條件到了，看 <Jump to="dip">低接卡</Jump> 分三次買。
              </>
            ) : (
              <>
                條件還沒到（恐慌指數要過 30、大盤要比最高跌 10%），看{" "}
                <Jump to="dip">低接卡</Jump>。
              </>
            ),
            undefined,
            undefined,
            dip.pass,
          )}
        </ul>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-bold">我手上的</h3>
        <HoldingsNow market={market} />
      </div>

      <div className="space-y-1">
        <h3 className="font-bold">大跌時手上庫存的四條規則</h3>
        <ol className="list-decimal space-y-0.5 pl-5 text-sm">
          {RULES.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** 低接卡：大家很怕、跌夠深的時候分三次買 */
export async function DipCard({ market }: { market: "tw" | "us" }) {
  await connection();
  const bars = await getUsBars(SYMS);
  const vix = bars["^VIX"].at(-1)?.close ?? null;
  const index = market === "tw" ? "^TWII" : "^GSPC";
  const d = dipCheck(vix, fromHigh(bars[index]));
  return (
    <div
      id="dip"
      className={`scroll-mt-20 space-y-2 rounded-xl p-3 text-sm ${d.pass ? "bg-amber-50 ring-2 ring-amber-500 dark:bg-amber-950/40" : "bg-[#e9e9e4] dark:bg-[#2a2e34]"}`}
    >
      <p className="font-bold">
        低接卡
        <span className="ml-2 font-normal text-stone-500">
          {market === "tw" ? "台股加權指數" : "標普 500"}・恐慌指數
        </span>
      </p>
      <p>
        原本的策略卡是「變強了才買」。低接卡相反：跌夠深、大家很怕的時候分三次買，賺恐慌退了以後的反彈。風險是接到一半還在跌，所以錢要分開算。
      </p>
      <ul className="space-y-1">
        {d.conds.map((c) => (
          <li key={c.text} className="flex items-baseline gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${c.ok ? "bg-emerald-600" : "bg-stone-400"}`}
            />
            <span className="flex-1">{c.text}</span>
            <span className="shrink-0 text-xs font-bold">
              {c.now}，{c.ok ? "到了" : "還沒"}
            </span>
          </li>
        ))}
      </ul>
      <p className="font-bold">
        {d.pass
          ? "今天：條件到了，可以照下面分三次買。"
          : "今天：還不到低接的時候。"}
      </p>
      <details>
        <summary className="cursor-pointer text-xs font-bold">
          條件到了怎麼買
        </summary>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-xs">
          <li>
            只買{market === "tw" ? "大盤（0050）" : "大盤（標普 500 指數基金）"}
            ，或追蹤清單裡賺錢的公司。
          </li>
          <li>先決定這張卡總共用多少錢，最多是你股票錢的一成。</li>
          <li>
            分三次：條件剛到買三分之一，再跌 5% 買三分之一，再跌 5%
            買最後三分之一。
          </li>
          <li>停損設在第三次買的價格再往下 8%。</li>
          <li>賣：回到月線上面先賣一半，剩下的照原本的停利。</li>
        </ol>
        <p className="mt-1 text-xs text-stone-500">
          30、10%、5%、8% 是一般常用的設定，不是課程講的，之後可以照你的習慣改。
        </p>
      </details>
    </div>
  );
}
