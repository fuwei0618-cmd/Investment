import Anthropic from "@anthropic-ai/sdk";
import { cacheLife } from "next/cache";
import { fresh, parseReasons, parseRss, type Headline } from "./headlines";

// 新聞說的原因：有 AI 金鑰時讓 AI 上網找當天新聞（英文新聞也會翻成中文），再拿當天數字對照是不是真的，附來源；沒有金鑰就只列新聞標題

const RSS = process.env.NEWS_RSS_BASE ?? "https://tw.stock.yahoo.com";

/** 雅虎股市新聞標題：國際股市、台股 */
export async function getHeadlines(cat: "intl-markets" | "tw-market") {
  "use cache";
  try {
    const r = await fetch(`${RSS}/rss?category=${cat}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(String(r.status));
    const list = fresh(parseRss(await r.text()), Date.now()).slice(0, 5);
    cacheLife("hours");
    return list;
  } catch {
    cacheLife("minutes");
    return [] as Headline[];
  }
}

export interface Reasons {
  lines: string[];
  sources: { title: string; url: string }[];
}

/** 讓 AI 查當天新聞，整理漲跌原因。用收盤日當鑰匙，同一天只查一次 */
export async function getReasons(
  market: "us" | "tw",
  date: string,
  facts: string,
): Promise<Reasons | null> {
  "use cache";
  if (!process.env.ANTHROPIC_API_KEY || !date) {
    cacheLife("minutes");
    return null;
  }
  const where = market === "us" ? "美國股市" : "台灣股市";
  const q = `${where} ${date} 收盤的數字：
${facts}

請上網找這一天的財經新聞（英文新聞也可以），整理這天漲跌的主要原因，再用上面的數字對照每個原因是不是真的。
規則：
- 只寫新聞上有寫的原因，不要自己猜。
- 寫 3 到 4 點，每點一行，用「- 」開頭，格式是「- 新聞說的原因｜對得上：哪個數字證明」或「- 新聞說的原因｜對不上：哪個數字不一樣」或「- 新聞說的原因｜沒有數字可以對」。
- 繁體中文白話，不要夾英文字，公司、人名用台灣常見的中文譯名。
- 除了這幾點，不要寫其他文字。`;
  try {
    const client = new Anthropic();
    const messages: Anthropic.Beta.BetaMessageParam[] = [
      { role: "user", content: q },
    ];
    let res: Anthropic.Beta.BetaMessage | null = null;
    for (let round = 0; round < 3; round++) {
      res = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 4000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        tools: [
          {
            type: "web_search_20260209",
            name: "web_search",
            max_uses: 3,
          },
        ],
        messages,
      });
      if (res.stop_reason !== "pause_turn") break;
      messages.push({ role: "assistant", content: res.content });
    }
    const sources = new Map<string, { title: string; url: string }>();
    let text = "";
    for (const b of res?.content ?? []) {
      if (b.type !== "text") continue;
      text += b.text;
      for (const c of b.citations ?? [])
        if (c.type === "web_search_result_location" && !sources.has(c.url))
          sources.set(c.url, { title: c.title ?? c.url, url: c.url });
    }
    const lines = parseReasons(text);
    if (!lines.length) throw new Error("沒有整理出原因");
    cacheLife("weeks");
    return { lines, sources: [...sources.values()].slice(0, 5) };
  } catch {
    cacheLife("minutes");
    return null;
  }
}
