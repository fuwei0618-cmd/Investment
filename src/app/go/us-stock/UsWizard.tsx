"use client";

import Link from "next/link";
import { useState } from "react";
import type { Holding } from "@/lib/desk";
import { US_INVERSE } from "@/lib/overnight";
import { ODD_MIN, usPlan } from "@/lib/us";
import type { UsPick } from "@/lib/usData";
import { fmt, usePersistentState } from "@/lib/storage";
import CheatSheet from "../CheatSheet";

const STEPS = [
  "能不能出手",
  "挑一檔",
  "算好買多少",
  "下單",
  "設停損停利",
  "記下來",
];
const box =
  "space-y-3 rounded-2xl bg-[#fffdf8] p-4 shadow-[0_1px_2px_rgba(60,40,10,.06),0_6px_16px_rgba(60,40,10,.08)] dark:bg-[#221d16]";
const r2 = (n: number) => Math.round(n * 100) / 100;

// 美股帶我做：強勢股突破，用國泰複委託下單
export default function UsWizard({
  date,
  market,
  picks,
}: {
  date: string;
  market: { close: number; ma: number; above: boolean } | null;
  picks: UsPick[];
}) {
  const [step, setStep] = useState(0);
  const [capital, setCapital] = usePersistentState<number>("us.capital.v1", 0);
  const [trades, setTrades] = usePersistentState<Holding[]>("us.trades.v1", []);
  const [code, setCode] = useState<string | null>(null);
  const pick = picks.find((p) => p.code === code) ?? null;
  const p = pick
    ? usPlan(capital, pick.close, pick.stopAt, pick.targetPct)
    : null;
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
      <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              className={`w-full rounded-xl px-2 py-1.5 text-left text-xs font-bold ${i === step ? "bg-[#b4651e] text-white" : i < step ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "bg-[#f3ead8] text-stone-500 dark:bg-[#2f281f]"}`}
            >
              {i + 1}. {s}
            </button>
          </li>
        ))}
      </ol>
      <section className={box}>
        {step === 0 && (
          <>
            <h2 className="text-xl font-black">① 今天能不能出手？</h2>
            {market ? (
              <p
                className={
                  market.above ? "" : "font-bold text-red-700 dark:text-red-400"
                }
              >
                標普 500 收 {fmt(market.close)}，月線 {fmt(market.ma)}，
                {market.above
                  ? "在月線上，可以照名單挑。"
                  : "在月線下，美股先不買股票。可以走放空：下一步第一個就是反向標普 500（SH）。"}
              </p>
            ) : (
              <p className="text-stone-500">
                標普 500 暫時抓不到，先不要出手。
              </p>
            )}
            <label className="block space-y-1">
              <span className="text-sm font-bold">
                你準備拿來買美股的總資金（美元）
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={capital || ""}
                onChange={(e) => setCapital(Number(e.target.value) || 0)}
                className="w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2 text-lg dark:border-stone-700 dark:bg-stone-900"
                placeholder="例如 10000"
              />
              <span className="block text-xs text-stone-500">
                只存在你這台裝置。每一筆最多用一成，所以這次最多{" "}
                {fmt(Math.floor(capital * 0.1))} 美元。
              </span>
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-black">② 挑一檔（資料日 {date}）</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              從美國前 100 大公司裡找：股價在 50 日和 200
              日均線上面、成交量是平常兩倍、收盤創 20 天新高。三個都過才算符合。
            </p>
            <ul className="space-y-2">
              {picks.slice(0, 12).map((x) => (
                <li key={x.code}>
                  <button
                    onClick={() => setCode(x.code)}
                    className={`w-full rounded-xl p-3 text-left ${code === x.code ? "ring-2 ring-[#b4651e]" : ""} bg-[#f3ead8] dark:bg-[#2f281f]`}
                  >
                    <span className="flex items-baseline justify-between">
                      <b>
                        {x.name}{" "}
                        <span className="text-stone-500">{x.code}</span>
                      </b>
                      <span
                        className={
                          x.pass ? "font-bold text-red-600" : "text-stone-500"
                        }
                      >
                        {x.pass ? "符合" : `過 ${x.score}/3`}
                      </span>
                    </span>
                    <span className="mt-1 grid gap-0.5 text-sm">
                      {x.conds.map((c) => (
                        <span
                          key={c.text}
                          className={c.ok ? "text-red-600" : "text-stone-400"}
                        >
                          {c.ok ? "✓" : "✗"} {c.text}
                        </span>
                      ))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {pick && (
              <div className="space-y-1 rounded-xl bg-white p-3 text-sm dark:bg-stone-900">
                <b>為什麼看這三個：</b>
                {pick.conds.map((c) => (
                  <p key={c.why}>・{c.why}</p>
                ))}
                {!pick.pass && (
                  <p className="text-amber-700 dark:text-amber-300">
                    還要等：
                    {pick.conds
                      .filter((c) => !c.ok)
                      .map((c) => c.need)
                      .join("、")}
                  </p>
                )}
                <a
                  href={`https://finance.yahoo.com/quote/${pick.code}/news`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 underline dark:text-blue-400"
                >
                  看新聞 ↗
                </a>
              </div>
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
                這次最多用 {fmt(p.budget)} 美元，買不到一整股（每股約{" "}
                {fmt(pick.close, 2)} 美元），碎股又最少要買 {ODD_MIN}{" "}
                美元。換一檔，或把總資金調高。
              </p>
            ) : (
              <dl className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]">
                  <dt className="text-xs font-bold">
                    買多少{p.odd ? "（碎股）" : ""}
                  </dt>
                  <dd className="text-2xl font-black">
                    {fmt(p.shares, p.odd ? 2 : 0)} 股
                  </dd>
                  <dd className="text-xs text-stone-500">
                    約 {fmt(p.cost, 2)} 美元，手續費另計
                    {p.odd &&
                      `。一成 ${fmt(p.budget)} 美元買不到一整股，改用碎股買 ${fmt(p.budget)} 美元`}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#f3ead8] p-3 dark:bg-[#2f281f]">
                  <dt className="text-xs font-bold">這一筆最多用</dt>
                  <dd className="text-2xl font-black">{fmt(p.budget)} 美元</dd>
                  <dd className="text-xs text-stone-500">總資金一成</dd>
                </div>
                <div className="rounded-xl bg-green-50 p-3 dark:bg-green-950/40">
                  <dt className="text-xs font-bold">停損價（認輸）</dt>
                  <dd className="text-2xl font-black text-green-700 dark:text-green-400">
                    {fmt(p.stop, 2)}
                  </dd>
                  <dd className="text-xs text-stone-500">
                    最多大約賠 {fmt(p.stopLoss, 2)} 美元
                  </dd>
                </div>
                <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
                  <dt className="text-xs font-bold">停利價（先賣一半）</dt>
                  <dd className="text-2xl font-black text-red-700 dark:text-red-400">
                    {fmt(p.target, 2)}
                  </dd>
                  <dd className="text-xs text-stone-500">{pick.exitText}</dd>
                </div>
              </dl>
            )}
            <p className="text-xs text-stone-500">
              停損{pick.stopText} 國泰複委託碎股的手續費是
              0.08%、沒有最低收費（ETF 一筆 3 美元），下單前還是看一下 App
              顯示的費率。
            </p>
          </>
        )}

        {step === 3 && pick && p && (
          <>
            <h2 className="text-xl font-black">
              ④ 照著下單（國泰證券 App 複委託）
            </h2>
            <CheatSheet
              title="複委託下單小抄（照 App 畫面找對應的欄位）"
              rows={[
                { label: "市場", value: "美國" },
                {
                  label: "股票代號",
                  value: `${pick.code} ${pick.name}`,
                  copy: pick.code,
                },
                {
                  label: "整股或碎股",
                  value: p.odd ? "碎股（上面分頁切到碎股）" : "整股",
                },
                { label: "買或賣", value: "買進" },
                p.odd
                  ? {
                      label: "買進金額",
                      value: `${fmt(p.budget)} 美元（約 ${fmt(p.shares, 2)} 股）`,
                      copy: String(p.budget),
                    }
                  : {
                      label: "股數",
                      value: `${fmt(p.shares)} 股`,
                      copy: String(p.shares),
                    },
                {
                  label: "價格（限價＝最多付多少）",
                  value: fmt(pick.close, 2),
                  copy: String(r2(pick.close)),
                },
                { label: "委託效期", value: "當日有效" },
              ]}
            />
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                帳戶裡要先有美元（台幣下單的話，App 會幫你換，但匯率比較差）。
              </li>
              <li>
                美股開盤是台灣晚上 21:30（11 月到 3 月
                22:30），可以白天先掛「預約單」。
              </li>
              <li>
                上面的限價是網站打開那一刻的價格。限價＝你「最多」願意付多少，現價比較低時會用比較低的價格成交，不會多付；開盤後漲到比限價高就買不到，可以重新打開這頁拿新價格。
              </li>
              <li>{pick.entryNote}</li>
              <li>
                送出後到「委託查詢」看有沒有成交，隔天早上看「成交回報」。
              </li>
            </ul>
          </>
        )}

        {step === 4 && pick && p && (
          <>
            <h2 className="text-xl font-black">⑤ 先設好停損和停利，再去睡覺</h2>
            <CheatSheet
              title="停損停利小抄"
              rows={[
                { label: "股票代號", value: pick.code, copy: pick.code },
                {
                  label: "停損觸發價",
                  value: `≤ ${fmt(p.stop, 2)}`,
                  copy: String(p.stop),
                },
                {
                  label: "停損賣出",
                  value: `全部 ${fmt(p.shares, p.odd ? 2 : 0)} 股`,
                  copy: String(p.shares),
                },
                {
                  label: "停利觸發價",
                  value: `≥ ${fmt(p.target, 2)}`,
                  copy: String(p.target),
                },
                {
                  label: "停利賣出",
                  value: `一半 ${fmt(p.half, p.odd ? 2 : 0)} 股`,
                  copy: String(p.half),
                },
              ]}
            />
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                在 App
                的複委託找「觸價單」「停損單」或「長效單」，照上面的數字設。
              </li>
              <li>
                App 沒有的話：每天早上 7:00
                起床看收盤價，跌破停損價就在當天晚上開盤賣。
              </li>
              {p.odd && (
                <li>
                  碎股多半不能設觸價單。設不了就看每天清晨的 LINE
                  收盤提醒，寫「要賣」就在當天晚上開盤賣。
                </li>
              )}
              <li>美股一天可以漲跌超過一成，停損一定要先設好，不要等。</li>
            </ul>
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
                      play:
                        pick.code === US_INVERSE.code
                          ? "放空（反向 ETF）"
                          : "美股強勢股突破",
                    },
                    ...trades.filter((t) => t.code !== pick.code),
                  ])
                }
                className="rounded-full bg-[#b4651e] px-4 py-2 font-bold text-white"
              >
                把這筆存進我的美股紀錄
              </button>
            )}
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
                    {t.saved} 買{" "}
                    {fmt(t.shares, Number.isInteger(t.shares) ? 0 : 2)} 股 @{" "}
                    {fmt(t.price, 2)}
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
                    沒買成，刪除
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-sm">
              記好的持股會出現在{" "}
              <Link href="/desk/us#hold" className="text-blue-600">
                美股實戰的持股提醒
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
