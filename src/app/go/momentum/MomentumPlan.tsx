"use client";

import { buyFeeOf } from "@/lib/fees";
import { planShares, rebalance, type MomentumPick } from "@/lib/momentum";
import { fmt, usePersistentState } from "@/lib/storage";

interface Held {
  month: string;
  items: { code: string; name: string; shares: number; price: number }[];
}

const thisMonth = () =>
  new Date()
    .toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" })
    .slice(0, 7);

// 動能 10 檔：輸入預算算零股，記下這個月買了什麼，下個月告訴你要賣哪些、買哪些
export default function MomentumPlan({
  picks,
  marketOk,
}: {
  picks: MomentumPick[];
  marketOk: boolean;
}) {
  const [budget, setBudget] = usePersistentState("momentum.budget.v1", 10000);
  const [held, setHeld] = usePersistentState<Held | null>(
    "momentum.hold.v1",
    null,
  );
  const list = marketOk ? picks : [];
  const shares = planShares(budget, list);
  const heldCodes = held?.items.map((h) => h.code) ?? [];
  const r = rebalance(
    heldCodes,
    list.map((p) => p.code),
  );
  const done = held?.month === thisMonth();
  const total = list.reduce((s, p, i) => s + p.price * shares[i], 0);
  const fees = list.reduce(
    (s, p, i) =>
      s + (shares[i] ? buyFeeOf("tw", p.code, p.price, shares[i]) : 0),
    0,
  );
  const input =
    "w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2 text-lg dark:border-stone-700 dark:bg-stone-900";

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold">
        這次要放多少錢（台幣）
        <input
          type="number"
          inputMode="numeric"
          className={input}
          value={budget || ""}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
      </label>

      {done && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
          這個月已經換好了，下個月第一個交易日再來看要不要換。
        </p>
      )}

      {held && !done && r.sell.length > 0 && (
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <b>先賣掉：</b>
          {held.items
            .filter((h) => r.sell.includes(h.code))
            .map((h) => `${h.name} ${h.code}（${fmt(h.shares)} 股）`)
            .join("、")}
          。它們掉出前 10 名了，賣掉的錢拿來買下面新進榜的。
        </div>
      )}

      {list.length > 0 && (
        <ol className="space-y-1.5 text-sm">
          {list.map((p, i) => (
            <li
              key={p.code}
              className="flex flex-wrap items-baseline gap-x-3 rounded-xl bg-[#f3ead8] px-3 py-2 dark:bg-[#2f281f]"
            >
              <b className="w-5 text-stone-500">{i + 1}</b>
              <b>
                {p.name} <span className="text-stone-500">{p.code}</span>
              </b>
              <span className="text-red-700 dark:text-red-400">
                一年漲 {fmt(p.ret * 100, 0)}%
              </span>
              <span>現價 {fmt(p.price, 2)}</span>
              <span className="ml-auto font-bold">
                {held && !done
                  ? r.keep.includes(p.code)
                    ? "續抱"
                    : `新買 ${fmt(shares[i])} 股`
                  : `買 ${fmt(shares[i])} 股`}
              </span>
            </li>
          ))}
        </ol>
      )}

      {list.length > 0 && !(held && !done) && (
        <p className="text-sm">
          全部買大約 <b>{fmt(total)}</b> 元，手續費大約 {fmt(fees)} 元。買不到 1
          股的就先跳過。
        </p>
      )}

      {list.length > 0 && !done && (
        <button
          onClick={() =>
            setHeld({
              month: thisMonth(),
              items: list.map((p, i) => {
                const old = held?.items.find((h) => h.code === p.code);
                return old && r.keep.includes(p.code)
                  ? old
                  : {
                      code: p.code,
                      name: p.name,
                      shares: shares[i],
                      price: p.price,
                    };
              }),
            })
          }
          className="rounded-full bg-[#b4651e] px-4 py-1.5 font-bold text-white"
        >
          我照這份買好了，記下來
        </button>
      )}

      {!marketOk && (
        <p className="text-sm">
          {held?.items.length
            ? "大盤跌破 200 日線，這個月手上的動能股全部賣掉，等大盤站回來再買。"
            : "大盤在 200 日線下，這個月不買，下個月第一個交易日再來看。"}
        </p>
      )}

      {held && (
        <details className="text-sm">
          <summary className="cursor-pointer text-stone-500">
            我 {held.month} 記下的持股（{held.items.length} 檔）
          </summary>
          <ul className="mt-1 space-y-0.5">
            {held.items.map((h) => (
              <li key={h.code}>
                {h.name} {h.code}：{fmt(h.shares)} 股 @ {fmt(h.price, 2)}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setHeld(null)}
            className="mt-1 text-xs text-stone-500 underline"
          >
            清掉重來
          </button>
        </details>
      )}
    </div>
  );
}
