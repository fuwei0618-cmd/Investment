"use client";

import { holdingAlert } from "@/lib/desk";
import type { Light } from "@/lib/today";
import { useHoldingQuotes } from "./Holdings";
import QCard from "./QCard";

const Q = "手上哪檔要賣？";

// 最上面第三個問題「手上哪檔要賣？」：只列碰到停損或停利的，其他一句話帶過
export default function SellCard({ market }: { market: "tw" | "us" }) {
  const { trades, loaded, quotes, err } = useHoldingQuotes(market);
  if (!loaded) return <Answer a="讀取中⋯⋯" />;
  if (!trades.length)
    return (
      <Answer a="手上沒有持股" s="照「帶我做」買完記下來，這裡就會幫你盯。" />
    );
  if (err)
    return <Answer a="現價暫時抓不到" s="打開下面「我的持股」再看一次。" />;
  const hits = trades.flatMap((t) => {
    const q = quotes.find((x) => x.code === t.code);
    const now = q?.price || q?.prev;
    if (!now) return [];
    const a = holdingAlert(t, now);
    return a.tone === "plain" ? [] : [{ t, a }];
  });
  if (!quotes.length) return <Answer a="讀取現價中⋯⋯" />;
  if (!hits.length)
    return (
      <Answer
        tone="green"
        a="沒有要賣的"
        s={`${trades.length} 檔都還在停損和停利中間，照計畫抱著。`}
      />
    );
  return (
    <QCard q={Q} tone="red">
      {hits.map(({ t, a }) => (
        <div key={t.code}>
          <p className="text-xl font-black">
            {t.name} {t.code}
            {a.tone === "red" ? " 跌破停損，要賣" : " 到停利，先賣一半"}
          </p>
          <p className="text-sm">{a.text}</p>
        </div>
      ))}
    </QCard>
  );
}

function Answer({
  a,
  s,
  tone = null,
}: {
  a: string;
  s?: string;
  tone?: Light | null;
}) {
  return (
    <QCard q={Q} tone={tone}>
      <p className="text-xl font-black">{a}</p>
      {s && <p className="text-sm">{s}</p>}
    </QCard>
  );
}
