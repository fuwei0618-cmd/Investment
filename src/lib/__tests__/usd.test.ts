import { describe, expect, it } from "vitest";
import { clientTalk, usdLevel, usdStats } from "../usd";

const s = [
  { date: "2025-01-01", value: 30 },
  { date: "2025-06-01", value: 32 },
  { date: "2025-10-01", value: 29 },
  { date: "2026-10-01", value: 31 },
];

describe("美元專區", () => {
  it("算出範圍、平均、位置和一年前", () => {
    const st = usdStats(s)!;
    expect(st.now).toBe(31);
    expect(st.min).toBe(29);
    expect(st.max).toBe(32);
    expect(st.avg).toBe(30.5);
    expect(st.pct).toBe(50); // 30、29 比現在便宜
    expect(st.yearAgo).toBe(29);
  });

  it("資料太少回傳 null", () => {
    expect(usdStats([s[0]])).toBeNull();
  });

  it("位置分五級", () => {
    expect(usdLevel(90).word).toBe("偏貴");
    expect(usdLevel(50).word).toBe("差不多中間");
    expect(usdLevel(10).word).toBe("偏便宜");
  });

  it("說法帶入今天的數字，沒有利差時不說能抵", () => {
    const st = usdStats(s)!;
    const talk = clientTalk(st, 1.6);
    expect(talk[0].say).toContain("31.00");
    expect(talk[2].say).toContain("1.6 個百分點");
    expect(clientTalk(st, -0.5)[2].say).toContain("不一定");
  });
});
