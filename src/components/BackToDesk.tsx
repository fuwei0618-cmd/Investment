"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "back.desk";

// 從實戰頁點連結出去後，左下角浮一顆「回實戰」，不用再跑去右上角
export default function BackToDesk() {
  const path = usePathname();
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    let back: string | null = null;
    try {
      if (path.startsWith("/desk")) sessionStorage.setItem(KEY, path);
      else back = sessionStorage.getItem(KEY);
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 掛載後才能讀 sessionStorage
    setHref(back);
  }, [path]);

  if (!href) return null;
  return (
    <Link
      href={href}
      onClick={() => {
        try {
          sessionStorage.removeItem(KEY);
        } catch {}
      }}
      className="fixed bottom-6 left-4 z-40 rounded-full bg-[#b4651e] px-4 py-2 text-sm font-bold text-white shadow-lg"
    >
      ← 回實戰
    </Link>
  );
}
