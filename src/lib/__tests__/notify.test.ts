import { describe, expect, it } from "vitest";
import { composeMessage, composeMorning, intradayAlerts } from "../notify";

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

describe("composeMorning", () => {
  it("紅燈時不列名單", () => {
    const t = composeMorning({
      date: "2026-10-19",
      verdict: { light: "red", title: "今天不買股票", todo: "休息" },
      events: [{ date: "2026-10-21", name: "台指期結算", why: "" }],
      picks: [{ title: "跟著投信買", names: ["國泰金 2882"] }],
    });
    expect(t).toContain("10/21 台指期結算");
    expect(t).not.toContain("國泰金");
  });
  it("綠燈列出全過的股票", () => {
    const t = composeMorning({
      date: "2026-10-19",
      verdict: v,
      events: [],
      picks: [{ title: "跟著投信買", names: ["國泰金 2882"] }],
    });
    expect(t).toContain("跟著投信買：國泰金 2882");
  });
});

describe("intradayAlerts", () => {
  it("跌破停損只提醒一次", () => {
    const q = [{ code: "2882", price: 64, prev: 66 }];
    const a = intradayAlerts([h], q, []);
    expect(a.keys).toEqual(["2882:stop"]);
    expect(intradayAlerts([h], q, a.keys).lines).toEqual([]);
  });
  it("一天大漲 5% 也提醒", () => {
    const a = intradayAlerts([h], [{ code: "2882", price: 74, prev: 70 }], []);
    expect(a.keys).toEqual(["2882:move"]);
  });
});
