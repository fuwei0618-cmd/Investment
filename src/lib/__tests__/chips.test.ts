import { describe, expect, it } from "vitest";
import { parseInstitutional, parseMargin, streak } from "../chips";

describe("麵包鎮的大戶", () => {
  const rows = [
    { date: "2026-10-13", name: "Foreign_Investor", buy: 5e9, sell: 3e9 },
    { date: "2026-10-13", name: "Foreign_Dealer_Self", buy: 1e8, sell: 0 },
    { date: "2026-10-13", name: "Investment_Trust", buy: 1e9, sell: 2e9 },
    { date: "2026-10-13", name: "total", buy: 9e9, sell: 9e9 },
    { date: "2026-10-14", name: "Foreign_Investor", buy: 4e9, sell: 1e9 },
    { date: "2026-10-14", name: "Dealer_Hedging", buy: 0, sell: 5e8 },
  ];
  it("三大法人照日期加總成億元，總計那行不算", () => {
    const days = parseInstitutional(rows);
    expect(days.map((d) => d.date)).toEqual(["2026-10-13", "2026-10-14"]);
    expect(days[0].net.foreign).toBeCloseTo(21);
    expect(days[0].net.trust).toBeCloseTo(-10);
    expect(days[1].net.dealer).toBeCloseTo(-5);
  });
  it("連續買超天數", () => {
    const days = parseInstitutional(rows);
    expect(streak(days, "foreign")).toBe(2);
    expect(streak(days, "dealer")).toBe(-1);
  });
  it("融資餘額", () => {
    const m = parseMargin([{ date: "2026-10-14", name: "MarginPurchaseMoney", TodayBalance: 3.1e11, YesBalance: 3e11 }]);
    expect(m?.today).toBeCloseTo(3100);
    expect(m?.change).toBeCloseTo(100);
  });
});
