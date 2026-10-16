"use client";

import { useEffect, useState } from "react";
import type { Holding } from "@/lib/desk";
import { usePersistentState } from "@/lib/storage";

type Status = { line: boolean; store: boolean; pass: boolean };

const STEPS = [
  "到 LINE 官方帳號管理後台（manager.line.biz）用自己的 LINE 登入，建立一個官方帳號，選免費方案。",
  "在官方帳號的「設定 → Messaging API」按「啟用」。",
  "到 LINE Developers（developers.line.biz）點進這個帳號：Basic settings 最下面的「Your user ID」抄下來；Messaging API 分頁最下面的 Channel access token 按「Issue」抄下來。",
  "用手機 LINE 掃 Messaging API 分頁的 QR code，把這個官方帳號加成好友。",
  "Vercel → 專案 → Storage → 建立 Upstash（Redis），連到這個專案。這是放持股清單的小倉庫，免費。",
  "Vercel → 專案 → Settings → Environment Variables 加四個：LINE_CHANNEL_ACCESS_TOKEN、LINE_USER_ID、PUSH_PASSCODE（自己訂的通關密語）、CRON_SECRET（隨便打一長串英數字）。",
  "Deployments → ⋯ → Create Deployment → main 重新上線，回到這裡輸入通關密語，按「同步並傳一則測試」。",
  "（要盤中警報才做）GitHub 的 Investment 專案 → Settings → Secrets and variables → Actions，加 SITE_URL（網站網址，例如 https://investment-beige-iota.vercel.app）和 CRON_SECRET（跟 Vercel 那個一樣）。",
];

// LINE 盤後提醒：設定狀態、把持股同步到雲端、傳一則測試
export default function LineSetup() {
  const [trades] = usePersistentState<Holding[]>("go.trades.v1", []);
  const [pass, setPass, loaded] = usePersistentState<string>(
    "push.pass.v1",
    "",
  );
  const [st, setSt] = useState<Status | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const ready = !!st && st.line && st.store && st.pass;

  useEffect(() => {
    fetch("/api/holdings")
      .then((r) => r.json() as Promise<Status>)
      .then(setSt)
      .catch(() => setSt({ line: false, store: false, pass: false }));
  }, []);

  // 打開實戰頁就把最新持股同步上去，盤後檢查才會用到新的
  useEffect(() => {
    if (!loaded || !ready || !pass) return;
    fetch("/api/holdings", {
      method: "PUT",
      body: JSON.stringify({ pass, trades }),
    }).catch(() => {});
  }, [loaded, ready, pass, trades]);

  const test = async () => {
    setMsg("傳送中⋯⋯");
    try {
      const a = await fetch("/api/holdings", {
        method: "PUT",
        body: JSON.stringify({ pass, trades }),
      });
      const aj = (await a.json()) as { error?: string };
      if (aj.error) throw new Error(aj.error);
      const b = await fetch("/api/cron/daily", {
        method: "POST",
        body: JSON.stringify({ pass }),
      });
      const bj = (await b.json()) as { error?: string };
      if (bj.error) throw new Error(bj.error);
      setMsg("傳好了，去 LINE 看看。");
    } catch (e) {
      setMsg(`沒傳成功：${e instanceof Error ? e.message : "失敗"}`);
    }
  };

  const dot = (ok: boolean | undefined) => (ok ? "✓" : "✗");
  return (
    <div className="space-y-2 rounded-xl bg-[#f3ead8] p-3 text-sm dark:bg-[#2f281f]">
      <p className="font-bold">LINE 盤後提醒</p>
      <ul className="list-disc space-y-0.5 pl-5">
        <li>
          <b>盤前 8:30：</b>今天能不能出手、近兩天大事、策略卡全過的股票。
        </li>
        <li>
          <b>盤中每 10 分鐘看一次：</b>持股碰到停損停利或大漲大跌 5%
          才傳，同一件事一天只傳一次。
        </li>
        <li>
          <b>盤後 14:40：</b>每檔持股收在哪、要不要賣，明天能不能出手。
        </li>
      </ul>
      {st && (
        <p className="text-xs">
          {dot(st.line)} LINE 金鑰　{dot(st.store)} 雲端倉庫　{dot(st.pass)}{" "}
          通關密語
        </p>
      )}
      {ready ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="通關密語"
            className="rounded-xl border-2 border-stone-200 bg-white px-3 py-1 dark:border-stone-700 dark:bg-stone-900"
          />
          <button
            onClick={test}
            disabled={!pass}
            className="rounded-full bg-[#b4651e] px-4 py-1 font-bold text-white disabled:opacity-40"
          >
            同步並傳一則測試
          </button>
          {msg && <span>{msg}</span>}
        </div>
      ) : (
        <details open={!!st}>
          <summary className="cursor-pointer font-bold">
            還沒設定好，照這 8 步做一次（約 25 分鐘）
          </summary>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
