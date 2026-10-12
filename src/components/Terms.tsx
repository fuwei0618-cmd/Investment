"use client";

import { useState } from "react";
import { GLOSSARY, findTerms } from "@/lib/glossary";

// 一個名詞：虛線底線，點一下在下面展開白話解釋。
export function Term({ term, children }: { term: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="underline decoration-blue-400 decoration-dotted underline-offset-4"
      >
        {children ?? term}
      </button>
      {open && (
        <span className="animate-rise my-1 block rounded-md bg-blue-50 px-2 py-1 text-xs text-zinc-700 dark:bg-blue-950 dark:text-zinc-200">
          <strong>{term}</strong>：{GLOSSARY[term]}
        </span>
      )}
    </>
  );
}

// 一段文字：自動把字典裡有的名詞變成可以點的。
export default function Terms({ text }: { text: string }) {
  return (
    <>
      {findTerms(text).map((p, i) => (typeof p === "string" ? p : <Term key={i} term={p.term} />))}
    </>
  );
}
