import { describe, expect, it } from "vitest";
import {
  brief,
  buyStreak,
  check,
  checkTrust,
  nextQuarterEnd,
  plan,
  trustStreak,
} from "../pick";

const bars = (n: number, f: (i: number) => [number, number, number]) =>
  Array.from({ length: n }, (_, i) => {
    const [close, max, volume] = f(i);
    return {
      date: `2026-09-${String(i + 1).padStart(2, "0")}`,
      close,
      max,
      volume,
    };
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
    const inst = ["13", "14", "15"].map((d) => ({
      date: `2026-10-${d}`,
      name: "Investment_Trust",
      buy: 2,
      sell: 1,
    }));
    const c = check(b, inst)!;
    expect(c).toMatchObject({
      high20: 105,
      breakout: true,
      streak: 3,
      pass: true,
    });
    expect(c.volRatio).toBeCloseTo(2.5);
    expect(check(b.slice(1), inst)).toBeNull();
  });
  it("突破後停損取較高的；還沒突破只用少 7%", () => {
    const b = bars(21, (i) => (i < 20 ? [50, 50, 1000] : [52, 52, 2500]));
    expect(check(b, [])!.stopAt).toBe(50);
    const c = bars(21, (i) => (i < 20 ? [60, 67.9, 1000] : [66.9, 67, 3000]));
    const k = check(c, [])!;
    expect(k.stopAt).toBe(62.22);
    expect(plan(50_000, 66.9, k.stopAt, k.targetPct).stopLoss).toBeGreaterThan(
      0,
    );
  });
  it("一成資金、整張加零股", () => {
    const p = plan(300000, 52, 50, 0.15);
    expect(p).toMatchObject({
      budget: 30000,
      shares: 576,
      lots: 0,
      odd: 576,
      stop: 50,
      target: 59.8,
    });
    expect(plan(3000000, 100, 93, 0.15)).toMatchObject({
      lots: 3,
      odd: 0,
      stop: 93,
    });
  });
});

describe("brief 資訊模板", () => {
  it("只過量的條件時，列出還要等的兩件事", () => {
    const c = bars(21, (i) => (i < 20 ? [60, 67.9, 1000] : [66.9, 67, 3000]));
    const inst = [
      { date: "2026-10-16", name: "Foreign_Investor", buy: 2, sell: 1 },
    ];
    const b = brief(check(c, inst)!);
    expect(b.buy).toBe(false);
    expect(b.rows.map((r) => r.ok)).toEqual([false, true, false]);
    expect(b.wait).toEqual([
      "外資或投信再連買 2 天（連到第 3 天）",
      "收盤站上 67.9",
    ]);
  });
});

describe("跟著投信買", () => {
  const inst = (days: string[], buy = 2, sell = 1) =>
    days.map((d) => ({
      date: `2026-10-${d}`,
      name: "Investment_Trust",
      buy,
      sell,
    }));
  it("只算投信自己的連買，外資買不算", () => {
    expect(
      trustStreak([
        ...inst(["14", "15", "16"]),
        { date: "2026-10-13", name: "Foreign_Investor", buy: 9, sell: 0 },
      ]),
    ).toBe(3);
  });
  it("投信連買三天、漲不到 15%、在月線上才符合；停損少 7%、停利 10%", () => {
    const b = bars(21, (i) => [100 + i * 0.5, 101 + i * 0.5, 1000]);
    const k = checkTrust(b, inst(["14", "15", "16"]))!;
    expect(k.conds.map((c) => c.ok)).toEqual([true, true, true]);
    expect(k.pass).toBe(true);
    expect(k.stopAt).toBe(102.3);
    expect(k.targetPct).toBe(0.1);
    expect(k.mustSell).toContain("2026-09-30");
  });
  it("漲太多就不符合", () => {
    const b = bars(21, (i) => [100 + i * 2, 101 + i * 2, 1000]);
    expect(checkTrust(b, inst(["14", "15", "16"]))!.conds[1].ok).toBe(false);
  });
  it("下一個季底", () => {
    expect(nextQuarterEnd("2026-10-16")).toBe("2026-12-31");
    expect(nextQuarterEnd("2026-02-03")).toBe("2026-03-31");
  });
});
