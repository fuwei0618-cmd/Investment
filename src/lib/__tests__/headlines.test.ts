import { describe, expect, it } from "vitest";
import { fresh, parseReasons, parseRss } from "../headlines";

const xml = `<rss><channel>
<item><title><![CDATA[美股收黑 半導體重挫]]></title><link>https://a.tw/1</link><pubDate>Fri, 16 Oct 2026 21:00:00 GMT</pubDate></item>
<item><title>美股收黑 半導體重挫</title><link>https://a.tw/2</link><pubDate>Fri, 16 Oct 2026 21:05:00 GMT</pubDate></item>
<item><title>油價 &amp; 美債</title><link>https://a.tw/3</link><pubDate>Mon, 12 Oct 2026 01:00:00 GMT</pubDate></item>
</channel></rss>`;

describe("parseRss", () => {
  it("讀標題連結時間，重複標題只留一則", () => {
    const l = parseRss(xml);
    expect(l.map((h) => h.title)).toEqual([
      "美股收黑 半導體重挫",
      "油價 & 美債",
    ]);
    expect(l[0].url).toBe("https://a.tw/1");
  });
  it("只留最近 36 小時", () => {
    const now = Date.parse("2026-10-17T07:00:00Z");
    expect(fresh(parseRss(xml), now).map((h) => h.url)).toEqual([
      "https://a.tw/1",
    ]);
  });
});

describe("parseReasons", () => {
  it("只拿「- 」開頭的行", () => {
    expect(
      parseReasons("以下是原因：\n- **半導體**連跌\n- 油價漲\n\n其他說明"),
    ).toEqual(["半導體連跌", "油價漲"]);
  });
});
