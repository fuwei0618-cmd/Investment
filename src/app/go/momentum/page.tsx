import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getMomentum } from "@/lib/momentumData";
import { fmt } from "@/lib/storage";
import MomentumPlan from "./MomentumPlan";

export const metadata = { title: "帶我做：動能 10 檔｜投資羅盤" };

const box =
  "space-y-3 rounded-2xl bg-[#fffdf8] p-4 shadow-[0_1px_2px_rgba(60,40,10,.06),0_6px_16px_rgba(60,40,10,.08)] dark:bg-[#221d16]";

async function Live() {
  await connection();
  const d = await getMomentum();
  if ("error" in d)
    return (
      <p className="text-sm text-stone-500">
        名單暫時抓不到，等一下再來。（卡在：{d.error}）
      </p>
    );
  const m = d.market;
  return (
    <>
      <p
        className={`rounded-xl px-3 py-2 text-sm ${m?.ok ? "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100" : "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100"}`}
      >
        {m
          ? `大盤 ${fmt(m.close)}，200 日線 ${fmt(m.ma)}：${m.ok ? "在線上，這個月可以買。" : "在線下，這個月空手。"}`
          : "大盤資料不夠，先不買。"}
        <span className="block text-xs opacity-70">
          資料到 {d.date}，從 {d.count} 檔大型股裡排出來
        </span>
      </p>
      <MomentumPlan picks={d.picks} marketOk={!!m?.ok} />
    </>
  );
}

export default function GoMomentum() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-black">📋 帶我做：動能 10 檔</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          一個月只看一次：買台股大型股裡，過去一年漲最強的 10
          檔，錢平均分。下個月再換一次。
        </p>
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          這是照規則排出來的，不是推薦哪一檔會漲。它會跟大盤一起大跌，回測最慘跌過
          42%。先用小錢，做半年以上再看成績。
        </p>
      </header>

      <section className={box}>
        <h2 className="text-xl font-black">① 這個月買哪 10 檔、各買幾股</h2>
        <Suspense
          fallback={<p className="text-sm text-stone-500">正在排名單⋯⋯</p>}
        >
          <Live />
        </Suspense>
      </section>

      <section className={box}>
        <h2 className="text-xl font-black">② 規則就三條</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>
            <b>每月第一個交易日看一次：</b>
            過去一年（不算最近一個月）漲最多的 10 檔，錢平均分。
          </li>
          <li>
            <b>掉出前 10 名就賣、新進榜的就買，</b>
            還在榜上的續抱，不用動。
          </li>
          <li>
            <b>大盤跌破 200 日線就全部賣掉空手，</b>
            站回來的那個月再買。
          </li>
        </ol>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          月中漲跌都不用看，也不設停損；它靠的是「強的股票常常會繼續強」，一個月換一次就好。
        </p>
      </section>

      <section className={box}>
        <h2 className="text-xl font-black">③ 為什麼是這套：十年回測</h2>
        <p className="text-sm">
          用 77 檔台股大型股、2016 到 2026 年的資料，扣掉手續費（6
          折）和證交稅：
        </p>
        <ul className="space-y-1 text-sm">
          <li>動能 10 檔：年化 45%，最慘跌 42%</li>
          <li>動能＋大盤濾網（這頁的做法）：年化 43%，最慘跌 34%</li>
          <li>同樣 77 檔平均買著不動：年化 36%，最慘跌 30%</li>
          <li>0050 買了放著：年化 24%，最慘跌 34%</li>
          <li>反過來買一年跌最多的 10 檔：年化 20%</li>
        </ul>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          換成挑 5 檔、20 檔，看 6 個月或 12
          個月，前五年、後五年分開算，都贏過平均買。但數字偏高：用的是「現在」的大型股，等於事先知道它們會變大，真的做起來會比較少。
        </p>
        <p className="text-sm">
          想比較其他做法，回去看{" "}
          <Link
            href="/go/tw-stock"
            className="text-blue-700 underline dark:text-blue-400"
          >
            大戶進場的波段
          </Link>
          。
        </p>
      </section>
    </div>
  );
}
