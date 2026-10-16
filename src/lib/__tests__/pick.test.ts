import { describe, expect, it } from "vitest";
import { buyStreak, check, plan } from "../pick";

const bars = (n: number, f: (i: number) => [number, number, number]) =>
  Array.from({ length: n }, (_, i) => {
    const [close, max, volume] = f(i);
    return { date: `2026-09-${String(i + 1).padStart(2, "0")}`, close, max, volume };
  });

describe("帶我做：台股短線", () => {
  it("大戶連買天數從最近一天往回數", () => {
    const rows = [
      { date: "2026-10-13", name: "Foreign_Investor", buy: 10, sell: 20 },
      { date: "2026-10-14", name: "Foreign_Investor", buy: 30, sell: 10 },
      { date: "2026-10-15", name: "Investment_Trust", buy: 5, sell: 0 },
      { date: "2026-10-16", name: "Foreign_Investor", buy: 5, sell: 1 },
      { date: "2026-10-16", name: "Dealer_self", buy: 0, sell: 99 },
    ];
    expect(buyStreak(rows)).toBe(3);
  });
  it("三個條件都過才算符合", () => {
    const b = bars(21, (i) => (i < 20 ? [100, 105, 1000] : [110, 111, 2500]));
    const inst = ["13", "14", "15"].map((d) => ({ date: `2026-10-${d}`, name: "Investment_Trust", buy: 2, sell: 1 }));
    const c = check(b, inst)!;
    expect(c).toMatchObject({ high20: 105, breakout: true, streak: 3, pass: true });
    expect(c.volRatio).toBeCloseTo(2.5);
    expect(check(b.slice(1), inst)).toBeNull();
  });
  it("一成資金、整張加零股、停損取較高的", () => {
    const p = plan(300000, 52, 50);
    expect(p).toMatchObject({ budget: 30000, shares: 576, lots: 0, odd: 576, stop: 50, target: 59.8 });
    expect(plan(3000000, 100, 80)).toMatchObject({ lots: 3, odd: 0, stop: 93 });
  });
});
