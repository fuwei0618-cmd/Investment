import { describe, expect, it } from "vitest";
import { composeMessage } from "../notify";

const h = {
  saved: "2026-10-01",
  code: "2882",
  name: "國泰金",
  price: 70,
  shares: 1000,
  stop: 65,
  target: 80,
};
const v = { light: "green" as const, title: "可以照策略卡出手", todo: "" };

describe("composeMessage", () => {
  it("跌破停損排在最前面", () => {
    const t = composeMessage({
      date: "2026-10-16",
      verdict: v,
      taiex: { close: 22341, ma: 22000 },
      holdings: [
        h,
        {
          ...h,
          code: "2454",
          name: "聯發科",
          price: 1400,
          stop: 1300,
          target: 1600,
        },
      ],
      prices: { "2882": 64, "2454": 1450 },
    });
    expect(t).toContain("10/16");
    expect(t.indexOf("要賣｜國泰金")).toBeLessThan(t.indexOf("聯發科"));
    expect(t).toContain("照計畫抱著");
  });
  it("沒有持股也會傳出手判斷", () => {
    expect(
      composeMessage({
        date: "2026-10-16",
        verdict: v,
        taiex: null,
        holdings: [],
        prices: {},
      }),
    ).toContain("可以照策略卡出手");
  });
});
