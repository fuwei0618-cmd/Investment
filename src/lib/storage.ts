"use client";

import { useEffect, useState } from "react";

// 資料先存在瀏覽器；讀寫失敗（無痕模式等）時退回預設值，不影響使用。
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 掛載後才能讀 localStorage
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {}
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, loaded]);

  return [value, setValue, loaded] as const;
}

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString("zh-TW", { maximumFractionDigits: digits, minimumFractionDigits: digits });

export const pct = (n: number | null, digits = 1) =>
  n === null || !isFinite(n) ? "—" : `${(n * 100).toFixed(digits)}%`;
