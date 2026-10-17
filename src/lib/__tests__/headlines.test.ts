import { describe, expect, it } from "vitest";
import {
  fresh,
  matchHeadline,
  parseReasons,
  parseRss,
  splitCheck,
} from "../headlines";

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

describe("splitCheck", () => {
  it("拆出數字對照", () => {
    expect(splitCheck("半導體連跌｜對得上：費半 -3.8%")).toEqual({
      why: "半導體連跌",
      check: "對得上：費半 -3.8%",
      tone: "ok",
    });
    expect(splitCheck("油價漲｜對不上：原油 -0.5%").tone).toBe("bad");
    expect(splitCheck("聯準會主席發言").tone).toBe("none");
  });
});

describe("matchHeadline", () => {
  const topics = [
    { words: ["半導體", "晶片"], name: "費城半導體", d: -0.038 },
    { words: ["油"], name: "原油", d: -0.005 },
    { words: ["黃金"], name: "黃金", d: null },
  ];
  it("說跌、真的跌：對得上", () => {
    expect(matchHeadline("費半連八黑 半導體重挫", topics)).toEqual({
      tone: "ok",
      text: "對得上：費城半導體 -3.8%",
    });
  });
  it("說漲、其實跌：對不上", () => {
    expect(matchHeadline("油價突破百元", topics)?.tone).toBe("bad");
  });
  it("看不出漲跌就只列數字；沒講到的、沒數字的不對", () => {
    expect(matchHeadline("晶片新規上路", topics)).toEqual({
      tone: "none",
      text: "費城半導體 -3.8%",
    });
    expect(matchHeadline("黃金大漲", topics)).toBeNull();
    expect(matchHeadline("央行理監事會", topics)).toBeNull();
  });
});
