// 新聞說的原因：從新聞標題、AI 整理的文字裡拆出一條一條

export interface Headline {
  title: string;
  url: string;
  at: number;
}

const unescape = (s: string) =>
  s
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();

const tag = (item: string, name: string) => {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? unescape(m[1]) : "";
};

/** 讀 RSS：標題、連結、時間；重複的標題只留一則 */
export function parseRss(xml: string): Headline[] {
  const seen = new Set<string>();
  const out: Headline[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = tag(m[1], "title");
    const url = tag(m[1], "link");
    const at = Date.parse(tag(m[1], "pubDate"));
    if (!title || !url.startsWith("http") || seen.has(title)) continue;
    seen.add(title);
    out.push({ title, url, at: Number.isNaN(at) ? 0 : at });
  }
  return out;
}

/** 只留最近幾小時內的（舊新聞不是昨晚的原因） */
export const fresh = (list: Headline[], now: number, hours = 36) =>
  list.filter((h) => h.at > 0 && now - h.at <= hours * 3600_000);

/** AI 整理的文字：每行「- 」開頭是一條原因 */
export function parseReasons(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[-・•＊*]\s*/.test(l))
    .map((l) =>
      l
        .replace(/^[-・•＊*]\s*/, "")
        .replace(/\*\*/g, "")
        .trim(),
    )
    .filter(Boolean)
    .slice(0, 5);
}

/** 一條原因拆成「新聞說的」和「數字對照」 */
export function splitCheck(line: string) {
  const [why, ...rest] = line.split("｜");
  const check = rest.join("｜").trim();
  const tone = check.startsWith("對得上")
    ? "ok"
    : check.startsWith("對不上")
      ? "bad"
      : "none";
  return { why: why.trim(), check, tone } as const;
}

export interface Topic {
  words: string[];
  name: string;
  d: number | null;
}

const UP = [
  "漲",
  "升",
  "揚",
  "攀",
  "突破",
  "創高",
  "飆",
  "收紅",
  "反彈",
  "走高",
];
const DOWN = [
  "跌",
  "挫",
  "收黑",
  "殺",
  "摔",
  "崩",
  "下滑",
  "賣壓",
  "走低",
  "重創",
];

/** 沒有 AI 時：看標題講到哪個數字、說漲還是跌，跟數字對一下 */
export function matchHeadline(title: string, topics: Topic[]) {
  const t = topics.find(
    (x) => x.d != null && x.words.some((w) => title.includes(w)),
  );
  if (!t) return null;
  const up = UP.some((w) => title.includes(w));
  const down = DOWN.some((w) => title.includes(w));
  const d = t.d!;
  const num = `${t.name} ${d > 0 ? "+" : ""}${(d * 100).toFixed(1)}%`;
  if (up === down) return { tone: "none" as const, text: num };
  const ok = up ? d > 0 : d < 0;
  return {
    tone: ok ? ("ok" as const) : ("bad" as const),
    text: `${ok ? "對得上" : "對不上"}：${num}`,
  };
}
