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
