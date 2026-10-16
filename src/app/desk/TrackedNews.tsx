"use client";

import { useEffect, useState } from "react";
import type { News } from "@/lib/pickData";
import { usePersistentState } from "@/lib/storage";

// 追蹤清單每檔最近三天的新聞（跟「我的追蹤清單」同一份名單）
export default function TrackedNews() {
  const [codes, , loaded] = usePersistentState<string[]>("live.codes.v1", [
    "2330",
    "0050",
  ]);
  const [news, setNews] = useState<Record<string, News[]> | null>(null);
  const key = codes.slice(0, 10).join(",");

  useEffect(() => {
    if (!loaded || !key) return;
    fetch(`/api/news?codes=${key}`)
      .then((r) => r.json() as Promise<{ news?: Record<string, News[]> }>)
      .then((j) => setNews(j.news ?? {}))
      .catch(() => setNews({}));
  }, [key, loaded]);

  if (!news) return <p className="text-sm text-stone-500">讀取新聞中⋯⋯</p>;
  const rows = Object.entries(news).filter(([, l]) => l.length);
  if (!rows.length)
    return (
      <p className="text-sm text-stone-500">追蹤的股票最近三天沒有抓到新聞。</p>
    );
  return (
    <ul className="space-y-2 text-sm">
      {rows.map(([code, list]) => (
        <li key={code}>
          <b>{code}</b>
          <ul className="mt-0.5 space-y-0.5">
            {list.map((n) => (
              <li key={n.link}>
                <span className="text-stone-500">{n.date.slice(5)}　</span>
                <a
                  href={n.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 underline dark:text-blue-400"
                >
                  {n.title}
                </a>
                <span className="text-xs text-stone-500">　{n.source}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
