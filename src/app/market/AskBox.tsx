"use client";

import { useEffect, useRef, useState } from "react";
import { ASK_MAX, AskFacts, LEVEL_NAMES, buildPrompt, parseSections, splitLevels } from "@/lib/ask";
import { usePersistentState } from "@/lib/storage";

interface Note {
  id: string;
  q: string;
  answer: string;
  sources: { title: string; url: string }[];
  at: string;
}

const EXAMPLES = ["同事說聯發科最近很強", "新聞說輝達財報超乎預期", "什麼是本益比？", "升息為什麼股票會跌？"];

// 一行文字：「第 N 關」變成可以點、會跳到那一關的按鈕；**粗體**照樣顯示。
function Line({ text }: { text: string }) {
  return (
    <>
      {splitLevels(text).map((p, i) =>
        typeof p === "string" ? (
          p.split(/\*\*(.+?)\*\*/g).map((s, j) => (j % 2 ? <strong key={`${i}-${j}`}>{s}</strong> : s))
        ) : (
          <a key={i} href={`#level-${p.level}`} className="mx-0.5 rounded bg-amber-100 px-1 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            {p.text}・{LEVEL_NAMES[p.level]}
          </a>
        ),
      )}
    </>
  );
}

function Answer({ note }: { note: Note }) {
  const sections = parseSections(note.answer);
  return (
    <div className="space-y-2">
      {sections.map((s, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 80}ms` }}
          className={`animate-rise rounded-md p-3 ${i === 0 ? "bg-amber-50 dark:bg-amber-950" : "border border-zinc-200 dark:border-zinc-800"}`}
        >
          <p className="mb-1 text-xs font-medium text-zinc-500">{s.title}</p>
          <div className="space-y-1">
            {s.body.split("\n").map((l, j) => {
              const bullet = l.match(/^\s*[-*・]\s+(.*)$/);
              if (!l.trim()) return null;
              return bullet ? (
                <p key={j} className="flex gap-1.5">
                  <span className="text-zinc-400">•</span>
                  <span>
                    <Line text={bullet[1]} />
                  </span>
                </p>
              ) : (
                <p key={j}>
                  <Line text={l} />
                </p>
              );
            })}
          </div>
        </div>
      ))}
      {note.sources.length > 0 && (
        <details className="text-xs text-zinc-500">
          <summary className="cursor-pointer">AI 查了哪些網頁（{note.sources.length}）</summary>
          <ul className="mt-1 space-y-0.5">
            {note.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" className="text-blue-600">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="text-xs text-zinc-500">AI 整理，可能有錯，也不是買賣建議。重要的數字請到第 6、7 關自己確認。</p>
    </div>
  );
}

const FREE_AI = [
  { name: "Claude", url: (p: string) => `https://claude.ai/new?q=${encodeURIComponent(p)}` },
  { name: "ChatGPT", url: (p: string) => `https://chatgpt.com/?q=${encodeURIComponent(p)}` },
];

// 看市場最上面：貼上聽到的名牌或新聞，AI 用白話整理；每次問的都存進「我的問答本」。
// auto＝網站設了金鑰，直接在這裡回答；否則用免費模式：複製提示到 Claude／ChatGPT 免費版，再把回答貼回來。
export default function AskBox({ auto, facts }: { auto: boolean; facts: Omit<AskFacts, "date"> }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needPass, setNeedPass] = useState(false);
  const [pass, setPass] = usePersistentState("ask.passcode.v1", "");
  const [notes, setNotes] = usePersistentState<Note[]>("ask.notes.v1", []);
  const [shown, setShown] = useState<string | null>(null);
  const [free, setFree] = useState<{ q: string; prompt: string; copied: boolean } | null>(null);
  const [pasted, setPasted] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);

  // 其他地方（例如第 6 關）可以帶一句話過來。
  useEffect(() => {
    const fill = (e: Event) => {
      setQ((e as CustomEvent<string>).detail);
      box.current?.closest("section")?.scrollIntoView({ behavior: "smooth" });
      box.current?.focus();
    };
    window.addEventListener("ask-prefill", fill);
    return () => window.removeEventListener("ask-prefill", fill);
  }, []);

  function save(text: string, answer: string, sources: Note["sources"]) {
    const note: Note = { id: `${Date.now()}`, q: text, answer, sources, at: new Date().toISOString() };
    setNotes([note, ...notes].slice(0, 100));
    setShown(note.id);
    setQ("");
  }

  // 免費模式第一步：組好提示、複製起來，接著讓他選要開哪個 AI。
  async function startFree(text: string) {
    const prompt = buildPrompt({ ...facts, date: new Date().toISOString().slice(0, 10) }, text);
    let copied = false;
    try {
      await navigator.clipboard.writeText(prompt);
      copied = true;
    } catch {}
    setFree({ q: text, prompt, copied });
    setPasted("");
    setError(null);
  }

  function saveFree() {
    if (!free || !pasted.trim()) return;
    save(free.q, pasted.trim(), []);
    setFree(null);
    setPasted("");
  }

  async function ask() {
    const text = q.trim();
    if (!text || busy) return;
    if (!auto) return startFree(text);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, passcode: pass }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setNeedPass(true);
        setError(pass ? "通關密語不對，再輸入一次。" : "請先輸入通關密語。");
        return;
      }
      if (data.error === "not-configured") return startFree(text);
      if (!res.ok) {
        setError(data.error ?? "查詢失敗，稍後再試。");
        return;
      }
      save(text, data.answer, data.sources ?? []);
      setNeedPass(false);
    } catch {
      setError("連不上網路，稍後再試。");
    } finally {
      setBusy(false);
    }
  }

  const current = notes.find((n) => n.id === shown);
  const past = notes.filter((n) => n.id !== shown);
  return (
    <section data-tour="ask" className="space-y-3 rounded-xl border-2 border-amber-300 bg-white p-4 dark:border-amber-700 dark:bg-zinc-900">
      <div>
        <p className="font-semibold">聽到一支股票或一則新聞？</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          貼上來，AI 幫你用白話整理：這家公司在做什麼、景氣對它順不順、消息靠不靠譜、要小心什麼。也可以問任何看不懂的名詞。
        </p>
      </div>
      <textarea
        ref={box}
        value={q}
        onChange={(e) => setQ(e.target.value.slice(0, ASK_MAX))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask();
        }}
        rows={3}
        placeholder="例如：同事說聯發科最近很強，可以買嗎？"
        className="w-full rounded-md border border-zinc-300 bg-transparent p-2 text-sm dark:border-zinc-700"
      />
      {!q && (
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => (
            <button key={e} onClick={() => setQ(e)} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs dark:bg-zinc-800">
              {e}
            </button>
          ))}
        </div>
      )}
      {needPass && (
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="通關密語"
          className="w-full rounded-md border border-zinc-300 bg-transparent p-2 text-sm dark:border-zinc-700"
        />
      )}
      <button
        onClick={ask}
        disabled={busy || !q.trim()}
        className="w-full rounded-full bg-amber-400 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
      >
        {busy ? "AI 正在上網查資料、整理中（大約半分鐘）…" : auto ? "幫我整理" : "幫我整理（用免費版 AI）"}
      </button>
      {busy && <div className="h-1 animate-pulse rounded-full bg-amber-300" />}
      {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      {free && (
        <div className="animate-rise space-y-2 rounded-md border border-amber-300 p-3 text-sm dark:border-amber-700">
          <p>
            <strong>① </strong>
            {free.copied ? "問題和回答規則已經複製好了。" : "問題已經準備好了。"}
          </p>
          <div>
            <p>
              <strong>② </strong>打開一個免費 AI，{free.copied ? "如果框裡是空的就貼上，" : ""}按送出：
            </p>
            <div className="mt-1 flex gap-2">
              {FREE_AI.map((a) => (
                <a
                  key={a.name}
                  href={a.url(free.prompt)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-full bg-zinc-900 py-1.5 text-center text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  開 {a.name}
                </a>
              ))}
            </div>
          </div>
          <p>
            <strong>③ </strong>等它回答完，按回答下方的「複製」，回來貼在這裡：
          </p>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={4}
            placeholder="把 AI 的回答整段貼上"
            className="w-full rounded-md border border-zinc-300 bg-transparent p-2 dark:border-zinc-700"
          />
          <div className="flex gap-2">
            <button
              onClick={saveFree}
              disabled={!pasted.trim()}
              className="flex-1 rounded-full bg-amber-400 py-1.5 font-medium text-zinc-900 disabled:opacity-50"
            >
              存進問答本
            </button>
            <button onClick={() => setFree(null)} className="rounded-full bg-zinc-100 px-4 py-1.5 dark:bg-zinc-800">
              取消
            </button>
          </div>
          {!free.copied && (
            <details className="text-xs text-zinc-500">
              <summary className="cursor-pointer">AI 那邊的框是空的？手動複製這段</summary>
              <textarea readOnly value={free.prompt} rows={4} className="mt-1 w-full rounded-md border border-zinc-300 bg-transparent p-2 dark:border-zinc-700" />
            </details>
          )}
          <p className="text-xs text-zinc-500">免費、不需要任何金鑰。免費版 AI 有每天次數限制。</p>
        </div>
      )}

      {current && (
        <div className="space-y-2 text-sm">
          <p className="font-medium">你問：{current.q}</p>
          <Answer note={current} />
        </div>
      )}

      {past.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">我的問答本（{notes.length}）</summary>
          <ul className="mt-2 space-y-1">
            {past.map((n) => (
              <li key={n.id} className="flex items-center gap-2">
                <button onClick={() => setShown(n.id)} className="min-w-0 flex-1 truncate text-left text-blue-600">
                  {n.q}
                </button>
                <span className="shrink-0 text-xs text-zinc-400">{n.at.slice(5, 10).replace("-", "/")}</span>
                <button
                  onClick={() => setNotes(notes.filter((x) => x.id !== n.id))}
                  aria-label="刪除"
                  className="shrink-0 px-1 text-xs text-zinc-400"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-zinc-500">問答本存在這台手機或電腦的瀏覽器裡，換裝置看不到。</p>
        </details>
      )}
    </section>
  );
}
