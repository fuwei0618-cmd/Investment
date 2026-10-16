"use client";

import Link from "next/link";
import { useState } from "react";
import { INVERSE, plan } from "@/lib/pick";
import type { Pick } from "@/lib/pickData";
import type { RiskResult } from "@/lib/risk";
import { fmt, usePersistentState } from "@/lib/storage";
import Brief from "./Brief";

interface Trade {
  saved: string;
  code: string;
  name: string;
  price: number;
  shares: number;
  stop: number;
  target: number;
}

const STEPS = [
  "能不能出手",
  "挑一檔",
  "算好買多少",
  "下單",
  "設停損停利",
  "記下來",
];
const box =
  "rounded-2xl bg-[#fffdf8] p-4 shadow-[0_1px_2px_rgba(60,40,10,.06),0_6px_16px_rgba(60,40,10,.08)] dark:bg-[#221d16]";
const yes = (ok: boolean) => (ok ? "text-red-600" : "text-stone-400");

// 打勾清單：每一行做完自己勾
function Todo({ items }: { items: React.ReactNode[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  return (
    <ol className="space-y-2">
      {items.map((it, i) => (
        <li key={i}>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl p-2.5 ${done.has(i) ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-[#f3ead8] dark:bg-[#2f281f]"}`}
          >
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
              checked={done.has(i)}
              onChange={() => {
                const n = new Set(done);
                if (n.has(i)) n.delete(i);
                else n.add(i);
                setDone(n);
              }}
            />
            <span className="text-[15px] leading-relaxed">
              <b className="mr-1">{i + 1}.</b>
              {it}
            </span>
          </label>
        </li>
      ))}
    </ol>
  );
}

export default function GoWizard({
  date,
  market,
  picks,
  inverse,
}: {
  date: string;
  market: { close: number; ma: number; above: boolean } | null;
  picks: Pick[];
  /** 反向 ETF 收盤價 */
  inverse: number | null;
}) {
  const [step, setStep] = useState(0);
  const [capital, setCapital] = usePersistentState<number>("go.capital.v1", 0);
  const [risk] = usePersistentState<RiskResult | null>("risk.result.v1", null);
  const [trades, setTrades] = usePersistentState<Trade[]>("go.trades.v1", []);
  const [code, setCode] = useState<string | null>(null);
  // 大盤在月線下可以改走放空：買反向 ETF
  // 大盤在月線下，一開始就直接走放空；要買股票可以切回去
  const [short, setShort] = useState(
    !!market && !market.above && inverse != null,
  );
  const inv: Pick | null =
    inverse == null
      ? null
      : {
          code: INVERSE.code,
          name: INVERSE.name,
          street: "反向 ETF",
          foreign: 0,
          trust: 0,
          close: inverse,
          high20: 0,
          volRatio: 0,
          streak: 0,
          breakout: false,
          pass: true,
          score: 3,
          news: [],
        };
  const pick = short ? inv : (picks.find((p) => p.code === code) ?? null);
  const p = pick ? plan(capital, pick.close, pick.high20, short) : null;
  const passed = picks.filter((x) => x.pass);
  const canNext =
    step === 0
      ? capital > 0
      : step === 1
        ? !!pick
        : step === 2
          ? !!p && p.shares > 0
          : true;

  return (
    <div className="space-y-3">
      {/* 進度：六步 */}
      <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              className={`w-full rounded-xl px-2 py-1.5 text-left text-xs font-bold ${i === step ? "bg-[#b4651e] text-white" : i < step ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "bg-[#f3ead8] text-stone-500 dark:bg-[#2f281f]"}`}
            >
              {i < step ? "✓ " : `${"①②③④⑤⑥"[i]} `}
              {s}
            </button>
          </li>
        ))}
      </ol>

      <section key={step} className={`${box} animate-rise space-y-3`}>
        {step === 0 && (
          <>
            <h2 className="text-xl font-black">① 今天能不能出手？</h2>
            <p
              className={`rounded-xl p-3 text-[15px] ${market?.above ? "bg-red-50 dark:bg-red-950/40" : "bg-stone-100 dark:bg-stone-800"}`}
            >
              {market == null
                ? "大盤資料暫時抓不到，先自己看一下加權指數在不在月線之上。"
                : market.above
                  ? `大盤 ${fmt(market.close)} 在月線 ${fmt(market.ma)} 之上，操作卡說可以出手。`
                  : `大盤 ${fmt(market.close)} 在月線 ${fmt(market.ma)} 之下。操作卡說這時候買股票先不衝，所以這次直接帶你走放空，下面已經幫你選好。`}
            </p>
            {market && !market.above && (
              <div className="space-y-2 rounded-xl border-2 border-dashed border-green-300 p-3 dark:border-green-900">
                <p className="text-sm">
                  大盤往下走的時候，也可以<b>放空</b>：買反向 ETF（
                  {INVERSE.code} {INVERSE.name}
                  ），大盤跌它就漲。一般帳戶就能買，最多賠光本金，但只適合放幾天到兩週。
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShort(true)}
                    aria-pressed={short}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${short ? "bg-green-700 text-white" : "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"}`}
                  >
                    {short ? "✓ 這次走放空" : "改走放空：反向 ETF"}
                  </button>
                  {short && (
                    <button
                      onClick={() => setShort(false)}
                      className="rounded-full bg-[#f3ead8] px-4 py-2 text-sm font-bold dark:bg-[#2f281f]"
                    >
                      回到買股票
                    </button>
                  )}
                </div>
                {short && inverse == null && (
                  <p className="text-xs text-red-700">
                    反向 ETF 的價格暫時抓不到，等一下再來。
                  </p>
                )}
              </div>
            )}
            <p className="text-sm">
              {risk ? (
                <>
                  你的風險屬性是 <b>{risk.type.name}</b>。
                  {risk.type.key === "conservative" ||
                  risk.type.key === "moderate"
                    ? "衝一把不太適合你，真的要做，總共只拿很小一筆錢練習。"
                    : "可以衝，但每一筆最多總資金一成。"}
                </>
              ) : (
                <>
                  還沒測風險屬性，建議先去{" "}
                  <Link href="/risk" className="text-blue-600">
                    第一幕測一下
                  </Link>
                  。
                </>
              )}
            </p>
            <label className="block space-y-1">
              <span className="text-sm font-bold">
                你準備拿來投資股票的總資金（元）
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={10000}
                value={capital || ""}
                onChange={(e) =>
                  setCapital(Math.max(0, Number(e.target.value)))
                }
                placeholder="例如 300000"
                className="w-full rounded-xl border-2 border-[#e6c48a] bg-white px-3 py-2 text-lg dark:bg-stone-900"
              />
              <span className="block text-xs text-stone-500">
                只存在你這台裝置。操作卡規定每一筆最多用一成，所以這次最多{" "}
                {fmt(Math.floor(capital * 0.1))} 元。
              </span>
            </label>
          </>
        )}

        {step === 1 && short && inv && (
          <>
            <h2 className="text-xl font-black">② 放空用哪一檔</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {market && !market.above
                ? "今天大盤在月線下，所以直接帶你走放空。想改買股票，回第一步按「回到買股票」。"
                : "這次你選了走放空。"}
            </p>
            <div className="rounded-xl border-2 border-green-400 bg-green-50 p-3 dark:bg-green-950/40">
              <b className="text-lg">
                {inv.name}{" "}
                <span className="text-sm text-stone-500">{inv.code}</span>
              </b>
              <span className="block text-sm">
                收盤 {fmt(inv.close, 2)}・台灣 50 指數跌 1%，它大約漲 1%
              </span>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                它每天重新對準「當天跌多少」，放久了即使大盤沒怎麼動也會慢慢變少，所以最多放兩週。
              </li>
              <li>
                它是用一般帳戶「現股買進」，不用開信用帳戶、不用融券，最多賠光放進去的錢。
              </li>
              <li>
                大盤收盤站回月線 {market ? fmt(market.ma) : ""}
                ，代表往下的理由不見了，就要賣。
              </li>
            </ul>
          </>
        )}

        {step === 1 && !short && (
          <>
            <h2 className="text-xl font-black">② 挑一檔（{date} 的資料）</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              先找今天外資和投信<b>都有買</b>
              的股票，再看操作卡的三個條件：大戶連買三天以上、成交量是平常兩倍以上、收盤突破前
              20 天最高價。三個都過才算符合。
            </p>
            {market && !market.above && (
              <p className="rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-950/40">
                提醒：今天大盤在月線下，操作卡說買股票先不衝。下面的名單只當練習；想跟著大盤往下賺，回第一步選「走放空」。
              </p>
            )}
            {passed.length === 0 && (
              <p className="rounded-xl bg-stone-100 p-3 text-sm dark:bg-stone-800">
                今天<b>沒有</b>
                三個條件都過的。操作卡的建議是不做，等明天再來看。下面是最接近的幾檔，只能拿來練習走流程。
              </p>
            )}
            <ul className="grid gap-2 sm:grid-cols-2">
              {picks.map((x) => (
                <li key={x.code}>
                  <button
                    onClick={() => setCode(x.code)}
                    aria-pressed={code === x.code}
                    className={`w-full rounded-xl border-2 p-3 text-left ${code === x.code ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40" : "border-transparent bg-[#f3ead8] dark:bg-[#2f281f]"}`}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <b className="text-lg">
                        {x.name}{" "}
                        <span className="text-sm text-stone-500">{x.code}</span>
                      </b>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${x.pass ? "bg-red-600 text-white" : "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300"}`}
                      >
                        {x.pass ? "符合" : `過 ${x.score}/3`}
                      </span>
                    </span>
                    <span className="block text-xs text-stone-500">
                      {x.street}・收盤 {fmt(x.close, 2)}・今天外資{" "}
                      {fmt(x.foreign, 1)} 億、投信 {fmt(x.trust, 1)} 億
                    </span>
                    <span className="mt-1 grid gap-0.5 text-sm">
                      <span className={yes(x.streak >= 3)}>
                        {x.streak >= 3 ? "✓" : "✗"} 大戶連買 {x.streak} 天（要 3
                        天以上）
                      </span>
                      <span className={yes(x.volRatio >= 2)}>
                        {x.volRatio >= 2 ? "✓" : "✗"} 成交量是平常{" "}
                        {fmt(x.volRatio, 1)} 倍（要 2 倍）
                      </span>
                      <span className={yes(x.breakout)}>
                        {x.breakout ? "✓" : "✗"} 收盤 {fmt(x.close, 2)}{" "}
                        {x.breakout ? "突破" : "還沒突破"}前高{" "}
                        {fmt(x.high20, 2)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {pick ? (
              <Brief x={pick} />
            ) : (
              <p className="text-sm text-stone-500">
                點一檔，看它的功課：今天要不要買、要等什麼、為什麼有人搶。
              </p>
            )}
          </>
        )}

        {step === 2 && pick && p && (
          <>
            <h2 className="text-xl font-black">
              ③ {pick.name}（{pick.code}）要買多少
            </h2>
            {p.shares === 0 ? (
              <p className="text-sm">
                這次最多用 {fmt(p.budget)} 元，買不到一股 {pick.name}（每股約{" "}
                {fmt(pick.close, 2)} 元）。回上一步換一檔，或把總資金調高。
              </p>
            ) : (
              <dl className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]">
                  <dt className="text-xs font-bold">這一筆最多用</dt>
                  <dd className="text-2xl font-black">{fmt(p.budget)} 元</dd>
                  <dd className="text-xs text-stone-500">總資金一成</dd>
                </div>
                <div className="rounded-xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]">
                  <dt className="text-xs font-bold">買多少</dt>
                  <dd className="text-2xl font-black">
                    {p.lots > 0 && `${p.lots} 張`}
                    {p.lots > 0 && p.odd > 0 && " ＋ "}
                    {p.odd > 0 && `${p.odd} 股零股`}
                  </dd>
                  <dd className="text-xs text-stone-500">
                    共 {fmt(p.shares)} 股，約 {fmt(p.cost)} 元（含手續費）
                  </dd>
                </div>
                <div className="rounded-xl bg-green-50 p-3 dark:bg-green-950/40">
                  <dt className="text-xs font-bold">停損價（認輸）</dt>
                  <dd className="text-2xl font-black text-green-700 dark:text-green-400">
                    {fmt(p.stop, 2)}
                  </dd>
                  <dd className="text-xs text-stone-500">
                    收盤跌破這裡，隔天開盤就賣。最多大約賠 {fmt(p.stopLoss)} 元
                  </dd>
                </div>
                <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
                  <dt className="text-xs font-bold">停利價（先賣一半）</dt>
                  <dd className="text-2xl font-black text-red-700 dark:text-red-400">
                    {fmt(p.target, 2)}
                  </dd>
                  <dd className="text-xs text-stone-500">
                    {short
                      ? "賺 8% 先賣一半，剩下大盤站回月線或放滿兩週就賣完"
                      : "賺 15% 先賣一半，剩下跌破 10 日均線再賣完"}
                  </dd>
                </div>
              </dl>
            )}
            <p className="text-xs text-stone-500">
              {short
                ? `價格用今天收盤價估。放空的規則是一般常識整理：跌 5% 停損、漲 8% 先賣一半，大盤站回月線或放滿兩週就全部賣。`
                : `價格用今天收盤價估。停損取「跌破突破點 ${fmt(pick.high20, 2)}」和「買價少 7%」兩個裡面比較高、會先碰到的那個。`}
            </p>
          </>
        )}

        {step === 3 && pick && p && (
          <>
            <h2 className="text-xl font-black">④ 照著下單（券商 App）</h2>
            <Todo
              items={[
                "打開你的券商 App 並登入，點「下單」或「證券交易」。",
                <>
                  交易類別選<b>「現股」買進</b>，不要選融資。
                </>,
                <>
                  股票代號輸入 <b>{pick.code}</b>，確認名稱是「{pick.name}」。
                </>,
                ...(p.lots > 0
                  ? [
                      <>
                        買整張：選<b>「整股」</b>，數量填 <b>{p.lots}</b>
                        （單位是張）。
                      </>,
                    ]
                  : []),
                ...(p.odd > 0
                  ? [
                      <>
                        買零股：{p.lots > 0 ? "另外再下一筆，" : ""}選
                        <b>「盤中零股」</b>，數量填 <b>{p.odd}</b>（單位是股）。
                      </>,
                    ]
                  : []),
                <>
                  價格選<b>「限價」</b>，填 <b>{fmt(pick.close, 2)}</b> 左右。
                  {short
                    ? "大盤當天如果已經大漲站回月線，就不要買。"
                    : `隔天買的話，開盤後股價沒跌破 ${fmt(pick.high20, 2)} 才買。`}
                </>,
                "時間：收盤前（13:00 到 13:25）下單，或隔天拉回時。",
                "按確認前再看一次：代號、張數或股數、價格、是「買進」。",
                "送出後到「委託查詢」或「成交回報」看有沒有成交。",
              ]}
            />
          </>
        )}

        {step === 4 && pick && p && (
          <>
            <h2 className="text-xl font-black">
              ⑤ 先設好停損和停利，再去做別的事
            </h2>
            <Todo
              items={[
                "在券商 App 找「條件單」「觸價單」或「智慧單」。",
                <>
                  設停損：<b>{pick.code}</b> 股價{" "}
                  <b>小於等於 {fmt(p.stop, 2)}</b> 時，<b>賣出全部</b>（
                  {fmt(p.shares)} 股）。
                </>,
                <>
                  設停利：股價 <b>大於等於 {fmt(p.target, 2)}</b> 時，
                  <b>賣出一半</b>（{fmt(Math.floor(p.shares / 2))} 股）。
                </>,
                "券商沒有條件單的話：手機設每天 13:20 的鬧鐘，看一次收盤價對照上面兩個價。",
                ...(short
                  ? [
                      <>
                        另外兩個一定要賣的時候：<b>大盤收盤站回月線</b>，或
                        <b>放滿兩週</b>（手機設一個兩週後的提醒）。
                      </>,
                    ]
                  : []),
                <>
                  跟自己約好：跌破 {fmt(p.stop, 2)} 隔天開盤就賣，
                  <b>不等、不加碼、不改說要長抱</b>。
                </>,
              ]}
            />
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-xl font-black">⑥ 記下來</h2>
            {pick && p && p.shares > 0 && (
              <button
                onClick={() =>
                  setTrades([
                    {
                      saved: new Date().toISOString().slice(0, 10),
                      code: pick.code,
                      name: pick.name,
                      price: pick.close,
                      shares: p.shares,
                      stop: p.stop,
                      target: p.target,
                    },
                    ...trades.filter((t) => t.code !== pick.code),
                  ])
                }
                className="rounded-full bg-[#b4651e] px-4 py-2 font-bold text-white"
              >
                把這筆存進我的操作紀錄
              </button>
            )}
            {trades.length > 0 ? (
              <ul className="space-y-1.5">
                {trades.map((t) => (
                  <li
                    key={t.code}
                    className="flex flex-wrap items-center gap-x-3 rounded-xl bg-[#f3ead8] px-3 py-2 text-sm dark:bg-[#2f281f]"
                  >
                    <b>
                      {t.name} {t.code}
                    </b>
                    <span>
                      {t.saved} 買 {fmt(t.shares)} 股 @ {fmt(t.price, 2)}
                    </span>
                    <span className="text-green-700 dark:text-green-400">
                      停損 {fmt(t.stop, 2)}
                    </span>
                    <span className="text-red-700 dark:text-red-400">
                      停利 {fmt(t.target, 2)}
                    </span>
                    <button
                      onClick={() =>
                        setTrades(trades.filter((x) => x.code !== t.code))
                      }
                      className="ml-auto text-xs text-stone-500 underline"
                    >
                      賣掉了，刪除
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500">還沒有紀錄。</p>
            )}
            <p className="text-sm">
              完成了！之後每天收盤看一次上面的停損停利價。想看手上全部投資健不健康，去{" "}
              <Link href="/portfolio" className="text-blue-600">
                持股健檢
              </Link>
              。
            </p>
          </>
        )}

        <div className="flex justify-between gap-2 pt-1">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="rounded-full bg-[#f3ead8] px-4 py-2 text-sm font-bold disabled:opacity-40 dark:bg-[#2f281f]"
          >
            ← 上一步
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="rounded-full bg-[#b4651e] px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              這步做完了，下一步 →
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
