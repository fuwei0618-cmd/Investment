import { describe, expect, it } from "vitest";
import { closeAndMa } from "../desk";
import { composeMessage, composeMorning } from "../notify";
import { usSlot, usVerdict } from "../us";

describe("usSlot", () => {
  it("夏令：UTC 12:30 是開盤前、13:30 略過", () => {
    expect(usSlot(new Date("2026-10-16T12:30:00Z")).slot).toBe("pre");
    expect(usSlot(new Date("2026-10-16T13:30:00Z")).slot).toBeNull();
    expect(usSlot(new Date("2026-10-16T21:00:00Z")).slot).toBe("post");
    expect(usSlot(new Date("2026-10-16T22:00:00Z")).slot).toBeNull();
  });
  it("冬令：UTC 13:30 是開盤前、22:00 是收盤後", () => {
    expect(usSlot(new Date("2026-11-16T12:30:00Z")).slot).toBeNull();
    expect(usSlot(new Date("2026-11-16T13:30:00Z")).slot).toBe("pre");
    expect(usSlot(new Date("2026-11-16T21:00:00Z")).slot).toBeNull();
    expect(usSlot(new Date("2026-11-16T22:00:00Z")).slot).toBe("post");
  });
  it("週末不傳，日期用紐約的", () => {
    expect(usSlot(new Date("2026-10-17T12:30:00Z")).slot).toBeNull();
    expect(usSlot(new Date("2026-10-16T21:00:00Z")).date).toBe("2026-10-16");
  });
});

describe("closeAndMa", () => {
  it("四捨五入一樣時給兩位小數", () => {
    expect(closeAndMa(7743.2, 7743.4)).toEqual(["7743.20", "7743.40"]);
    expect(closeAndMa(7743, 7700)).toEqual(["7743", "7700"]);
  });
});

describe("美股訊息", () => {
  const v = usVerdict({ above: true, vix: 25, season: "green" });
  it("恐慌指數 25 算市場有點緊張", () => {
    expect(v.title).toBe("可以出手，挑最強的一兩檔就好");
    expect(v.todo).toContain("標普 500");
  });
  it("開盤前講今晚", () => {
    const t = composeMorning({
      date: "2026-10-16",
      verdict: v,
      market: "us",
      facts: ["標普 500 收 7743"],
      events: [],
      picks: [{ title: "強勢股突破", names: ["輝達 NVDA"] }],
    });
    expect(t).toContain("美股開盤前 10/16");
    expect(t).toContain("今晚能不能出手");
    expect(t).toContain("輝達 NVDA");
  });
  it("收盤後價格只留兩位小數", () => {
    const t = composeMessage({
      date: "2026-10-16",
      verdict: v,
      market: "us",
      taiex: { close: 7743.2, ma: 7743.4 },
      holdings: [
        {
          saved: "2026-10-16",
          code: "SPGI",
          name: "標普全球",
          price: 429.3,
          shares: 2,
          stop: 425.78,
          target: 493.19,
        },
      ],
      prices: { SPGI: 431.123456 },
    });
    expect(t).toContain("美股收盤 10/16");
    expect(t).toContain("標普 500 7743.20，月線 7743.40");
    expect(t).toContain("收 431.12");
  });
});
