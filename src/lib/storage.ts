"use client";

import { useEffect, useRef, useState } from "react";

const SYNC = "persist-sync";

// 資料先存在瀏覽器；讀寫失敗（無痕模式等）時退回預設值，不影響使用。
// 同一頁有好幾個地方用同一個 key（例如持股提醒和最上面的「哪檔要賣」），一邊改了另一邊會跟著更新。
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const last = useRef<string | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(key);
        if (raw && raw !== last.current) {
          last.current = raw;
          setValue(JSON.parse(raw) as T);
        }
      } catch {}
    };
    read();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 掛載後才能讀 localStorage
    setLoaded(true);
    const onSync = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) read();
    };
    window.addEventListener(SYNC, onSync);
    return () => window.removeEventListener(SYNC, onSync);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      const raw = JSON.stringify(value);
      if (raw === last.current) return;
      last.current = raw;
      localStorage.setItem(key, raw);
      window.dispatchEvent(new CustomEvent(SYNC, { detail: key }));
    } catch {}
  }, [key, value, loaded]);

  return [value, setValue, loaded] as const;
}

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString("zh-TW", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });

export const pct = (n: number | null, digits = 1) =>
  n === null || !isFinite(n) ? "—" : `${(n * 100).toFixed(digits)}%`;
